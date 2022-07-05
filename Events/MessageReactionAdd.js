const Guild = require('../Modules/Guild');

module.exports = {
	name: 'messageReactionAdd',
	once: false,
	async execute(reaction, member) {
		if (reaction.message.partial) await reaction.message.fetch();
		if (reaction.partial) await reaction.fetch().catch(e => null);

		const guild = new Guild(reaction.message.guild.id);

		const hasReactionRoleIntent = await guild.HasReactionRoleIntent(reaction.message.id, reaction.emoji.id);
		if (hasReactionRoleIntent) {
			const preferences = await guild.ReactionRolePreferences;
			for (let reactionRole of preferences) {
				if (reactionRole.messageId === reaction.message.id && reactionRole.emojiId === reaction.emoji.id) {
					const user = await interaction.client.guilds.cache.get(reaction.message.guild.id).members.fetch(member.id);
					const role = await reaction.message.guild.roles.cache.get(reactionRole.roleId);
					if (role != undefined) user.roles.add(role).catch(e => null)
				}
			}
		}
	},
};