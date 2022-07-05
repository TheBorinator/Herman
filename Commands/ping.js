const { SlashCommandBuilder } = require('@discordjs/builders');
const prettyMS = require('pretty-ms');
const Embed = require('../Modules/Embed');

module.exports = {
	module: 'Utility',
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong'),
	async execute(interaction, guild) {
		const promises = [
			interaction.client.shard.fetchClientValues('guilds.cache.size'),
			interaction.client.shard.broadcastEval(c => c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)),
		];
		const results = await Promise.all(promises);
		const totalGuilds = results[0].reduce((acc, guildCount) => acc + guildCount, 0);
		const totalMembers = results[1].reduce((acc, memberCount) => acc + memberCount, 0);

		const uptime = prettyMS(interaction.client.uptime, { verbose: true, secondsDecimalDigits: 0 })

		await interaction.reply(new Embed({ 
			description: `Bot latency: ${Math.abs(Date.now() - interaction.createdTimestamp)} ms
			API latency: ${Math.round(interaction.client.ws.ping)} ms`,
			footer: `Shard ${interaction.guild.shardId} • ${totalGuilds} guilds • ${totalMembers} members • Online for ${uptime}`
		}).Regular);
	},
};