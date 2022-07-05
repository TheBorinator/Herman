const Embed = require('../Modules/Embed');
const Guild = require('../Modules/Guild');
const Constants = require('../Modules/Constants');
const names = require('../Data/names');

module.exports = {
	name: 'guildMemberAdd',
	once: false,
	async execute(member) {
		const guild = new Guild(member.guild.id);
		const canCompleteAction = await guild.Onboarding();
		if (!canCompleteAction) return;
		const preferences = await guild.GuildJoinPreferences;

		if (preferences.welcomeMessageEnabled) {
			const welcomeMessageArray = await guild.WelcomeMessagePreferences;
			for (welcomeMessage of welcomeMessageArray) {
				if (welcomeMessage.type === 'guildMessage') {
					let message = welcomeMessage.message.replace(`{{user}}`, `<@${member.id}>`).replace(`{{guild}}`, member.guild.name);
					const welcomeChannel = await member.guild.channels.cache.get(welcomeMessage.channelId)
					if (welcomeChannel != undefined) await welcomeChannel.send(new Embed({ description: message }).Regular);
				}
				if (welcomeMessage.type === 'dm') {
					let message = welcomeMessage.message.replace(`{{user}}`, `<@${member.id}>`).replace(`{{guild}}`, member.guild.name);
					await member.send(new Embed({ description: message }).Regular).catch(e => null);
				}
			}
		}

		if (preferences.roleAssignEnabled) {
			const roleAssignArray = await guild.RoleAssignPreferences;
			let roleAssignFunctions = [];
			for (roleAssignment of roleAssignArray) {
				const role = await member.guild.roles.cache.get(roleAssignment.roleId);
				if (role != undefined) {
					roleAssignFunctions.push({ func: assignRole, member: member, role: role, delay: roleAssignment.delay }) // why not defined
				}
			}
			Promise.all(roleAssignFunctions.map((promise) => promise.func(promise.member, promise.role, promise.delay)));
		}

		if (preferences.userSafetyScreeningEnabled) {
			const usernameContainsName = names.some(name => member.user.username.toLowerCase().includes(name.toLowerCase()));
			if (usernameContainsName) await member.send(new Embed({ 
				description: Constants.USERNAME_CONTAINS_NAME, 
			}).Warning).catch(e => null);
		}

		const eventLogPreferences = await guild.EventLogPreferences;
		if (eventLogPreferences == []) return;
		if (!eventLogPreferences.logMemberAdd) return;

		let logChannel;
		logChannel = await member.client.channels.fetch(eventLogPreferences.eventLogChannel).catch(e => logChannel = null);
		if (logChannel === null) return;
		await logChannel.send(new Embed({ 
			description: `**Member Joined**\n<@${member.id}> ${member.user.username}#${member.user.discriminator}`,
			footer: `ID: ${member.id}`,
			timestamp: true
		}).Regular);
	},
};

function assignRole(member, role, delay) {
	setTimeout(() => {
		member.roles.add(role).catch(e => null);
	}, delay * 1000);
}