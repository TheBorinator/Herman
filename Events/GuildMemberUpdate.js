const Embed = require('../Modules/Embed');
const Guild = require('../Modules/Guild');

module.exports = {
	name: 'guildMemberUpdate',
	once: false,
	async execute(oldMember, newMember) {
		/* FIXME:
		const guild = new Guild(newMember.guild.id);
		const canCompleteAction = await guild.Onboarding();
		if (!canCompleteAction) return;
		const eventLogPreferences = await guild.EventLogPreferences;
		if (eventLogPreferences == []) return;
		if (!eventLogPreferences.logMemberRoleUpdate || !eventLogPreferences.logMemberNicknameUpdate) return;

		let logChannel;
		logChannel = await newMember.client.channels.fetch(eventLogPreferences.eventLogChannel).catch(e => logChannel = null);
		if (logChannel === null) return;

		if (eventLogPreferences.logMemberRoleUpdate) {
			if (oldMember.roles.cache === newMember.roles.cache) return;
			await logChannel.send(new Embed({ 
				author: {
					name: newMember.user.username ?? null,
					iconURL: newMember.user.displayAvatarURL() ?? null
				},
				description: `**Member Roles Updated**\n<@${newMember.id}>`,
				footer: `ID: ${newMember.id}`,
				timestamp: true
			}).Regular);
		}

		if (eventLogPreferences.logMemberNicknameUpdate) {
			if (oldMember.nickname === newMember.nickname) return;
			await logChannel.send(new Embed({ 
				author: {
					name: newMember.user.username ?? null,
					iconURL: newMember.user.displayAvatarURL() ?? null
				},
				description: `**Member Nickname Updated**\n<@${newMember.id}>\nPrevious Nickname:\n${oldMember.nickname ?? newMember.user.username}\nNew Nickname:\n${newMember.nickname ?? newMember.user.username}`,
				footer: `ID: ${newMember.id}`,
				timestamp: true
			}).Regular);
		}
		*/
	},
};