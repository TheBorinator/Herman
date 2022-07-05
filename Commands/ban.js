const { SlashCommandBuilder } = require('@discordjs/builders');
const Constants = require('../Modules/Constants');
const Embed = require('../Modules/Embed');
const ModLog = require('../Modules/ModLog');

module.exports = {
	module: 'Moderation',
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Bans a user with a reason')
		.addUserOption(option =>
			option
				.setName('user')
				.setDescription('The user you want to ban')
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName('reason')
				.setDescription('Your reason for banning the user')
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName('message-purge')
				.setDescription(`Number of days of the user's messages to delete`)
				.setRequired(true)
				.addChoice(`Don't delete any messages`, '0')
				.addChoice('1 day', '1')
				.addChoice('2 days', '2')
				.addChoice('3 days', '3')
				.addChoice('4 days', '4')
				.addChoice('5 days', '5')
				.addChoice('6 days', '6')
				.addChoice('1 week', '7')),

	async execute(interaction, guild) {
		const userProvidedInInteraction = interaction.options.getUser('user');
		const user = await interaction.client.guilds.cache.get(interaction.guild.id).members.fetch(userProvidedInInteraction.id);
		const days = interaction.options.getString('message-purge');
		const reason = interaction.options.getString('reason');

		if (!interaction.member.permissions.has('BAN_MEMBERS')) return await interaction.reply(new Embed({
			description: Constants.USER_LACKING_PERMISSIONS.replace('{{action}}', 'ban'),
			ephemeral: true
		}).Error);

		if (!user) return await interaction.reply(new Embed({
			description: Constants.USER_PROCESSING_ERROR,
			ephemeral: true
		}).Error);

		if (user.user.bot) return await interaction.reply(new Embed({
			description: Constants.BOT_IMMUNITY.replace('{{action}}', 'ban'),
			ephemeral: true
		}).Error);

		if (!interaction.guild.me.permissions.has("BAN_MEMBERS")) return await interaction.reply(new Embed({
			description: Constants.SELF_LACKING_PERMISSIONS.replace('{{permission}}', 'BAN_MEMBERS'),
			ephemeral: true
		}).Error);

		if (!user.bannable) return await interaction.reply(new Embed({
			description: Constants.BOT_LACKING_PERMISSIONS.replace('{{action}}', 'ban'),
			ephemeral: true
		}).Error);

		if (interaction.member.roles.highest.position <= user.roles.highest.position) return await interaction.reply(new Embed({
			description: `${Constants.USER_ROLE_IMBALANCE.replace('{{action}}', 'ban')} ${((interaction.member.roles.highest.position === user.roles.highest.position) ? Constants.USER_ROLE_IMBALANCE_SAME_ROLE : Constants.USER_ROLE_IMBALANCE_HIGHER_ROLE)}`,
			ephemeral: true
		}).Error);

		if (reason.length > 100) return await interaction.reply(new Embed({
			description: Constants.REASON_TOO_LONG,
			ephemeral: true
		}).Error);

		await user.send(new Embed({ 
			description: Constants.DISRUPTIVE_PUNISHMENT_DM.replace('{{action}}', 'banned').replace('{{guild}}', interaction.guild.name).replace('{{reason}}', reason), 
		}).Warning).catch(e => null);
		await user.ban({ days: +days, reason: reason }).catch(e => null);
		await new ModLog().CreateModLog(interaction.guild.id, user.id, interaction.member.id, 'Ban', reason, interaction.member.guild);
		await interaction.reply(new Embed({ 
			description: Constants.DISRUPTIVE_PUNISHMENT_PUBLIC_MESSAGE.replace('{{action}}', 'Banned').replace('{{user}}', user).replace('{{reason}}', reason), ephemeral: false 
		}).Success);
	},
}