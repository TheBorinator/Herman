const Embed = require('../Modules/Embed');
const Guild = require('../Modules/Guild');

module.exports = {
	name: 'messageDelete',
	once: false,
	async execute(message) {
		const guild = new Guild(message.guild.id);
		const canCompleteAction = await guild.Onboarding();
		if (!canCompleteAction) return;
		const eventLogPreferences = await guild.EventLogPreferences;
		if (eventLogPreferences == []) return;
		if (!eventLogPreferences.logMessageDeletions) return;

		let logChannel;
		logChannel = await message.client.channels.fetch(eventLogPreferences.eventLogChannel).catch(e => logChannel = null);
		if (logChannel === null) return;
		await logChannel.send(new Embed({ 
			author: {
				name: message.author.username ?? null,
				iconURL: message.author.displayAvatarURL() ?? null
			},
			description: `**Message Deleted in ${message.channel}**\n${message.content}`,
			timestamp: true
		}).Regular);
	},
};
