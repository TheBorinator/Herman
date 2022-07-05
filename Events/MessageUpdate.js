const Embed = require('../Modules/Embed');
const Guild = require('../Modules/Guild');
const Constants = require('../Modules/Constants');

module.exports = {
	name: 'messageUpdate',
	once: false,
	async execute(oldMessage, newMessage) {
		if (newMessage.author.id === Constants.HERMAN_ID) return;
		if (newMessage.webhookId) return;
		const guild = new Guild(newMessage.guild.id);
		const canCompleteAction = await guild.Onboarding();
		if (!canCompleteAction) return;
		const eventLogPreferences = await guild.EventLogPreferences;
		if (eventLogPreferences == []) return;
		if (!eventLogPreferences.logMessageUpdates) return;
		
		let logChannel;
		logChannel = await newMessage.client.channels.fetch(eventLogPreferences.eventLogChannel).catch(e => logChannel = null);
		if (logChannel === null) return;
		await logChannel.send(new Embed({ 
			author: {
				name: newMessage.author.username || null,
				iconURL: newMessage.author.displayAvatarURL() || null
			},
			description: `**Message Edited in ${newMessage.channel}**\nPrevious Message:\n${oldMessage.content}\nUpdated Message:\n${newMessage.content}\n[Jump to message](${newMessage.url})`,
			timestamp: true
		}).Regular);
	},
};