const Embed = require('../Modules/Embed');
const Guild = require('../Modules/Guild');

module.exports = {
	name: 'guildCreate',
	once: false,
	async execute(guild) {
		await new Guild(guild.id).Create();

		const welcomeEmbed = await new Embed({ description: `**Thanks for adding Herman.**\nHerman is a multi-purpose moderation bot.`, footer: `Use /help to get started.` }).Regular;

		if (guild.channels.cache.find(channel => channel.name === "general") != undefined) 
			return guild.channels.cache.find(channel => channel.name === "general").send(welcomeEmbed);

		if (guild.systemChannel != null) 
			return guild.systemChannel.send(welcomeEmbed);
	},
};
