const Embed = require('../Modules/Embed');
const Guild = require('../Modules/Guild');

module.exports = {
	name: 'guildMemberRemove',
	once: false,
	async execute(member) {
		const guild = new Guild(member.guild.id);
		const canCompleteAction = await guild.Onboarding();
		if (!canCompleteAction) return;
		const eventLogPreferences = await guild.EventLogPreferences;
		if (eventLogPreferences == []) return;
		if (!eventLogPreferences.logMemberRemove) return;

		let logChannel;
		logChannel = await member.client.channels.fetch(eventLogPreferences.eventLogChannel).catch(e => logChannel = null);
		if (logChannel === null) return;
		await logChannel.send(new Embed({ 
			description: `**Member Left**\n<@${member.id}> ${member.user.username}#${member.user.discriminator}`,
			footer: `ID: ${member.id}`,
			timestamp: true
		}).Regular);
	},
};