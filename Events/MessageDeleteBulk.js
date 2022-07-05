const Embed = require('../Modules/Embed');
const Guild = require('../Modules/Guild');

module.exports = {
	name: 'messageDeleteBulk',
	once: false,
	async execute(client, messages) {
		//BREAKING: need to edit discord.js/src/client/actions/MessageDeleteBulk.js to return client, as it is not returned as part of the message collection by default.
		const guild = new Guild(messages.first().guildId);
		const canCompleteAction = await guild.Onboarding();
		if (!canCompleteAction) return;
		const eventLogPreferences = await guild.EventLogPreferences;
		if (eventLogPreferences == []) return;
		if (!eventLogPreferences.logMessageBulkDeletions) return;

		let logChannel;
		logChannel = await client.channels.fetch(eventLogPreferences.eventLogChannel).catch(e => logChannel = null);
		if (logChannel === null) return;
		await logChannel.send(new Embed({ 
			description: `**Messages Deleted en Masse in <#${messages.first().channelId}>**\n${messages.size} messages deleted`,
			timestamp: true
		}).Regular);
	},
};