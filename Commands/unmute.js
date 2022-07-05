const { SlashCommandBuilder } = require('@discordjs/builders');
const Constants = require('../Modules/Constants');
const Embed = require('./../modules/embed');

module.exports = {
	module: 'Moderation',
	data: new SlashCommandBuilder()
		.setName('unmute')
		.setDescription('Unmute a user')
		.addUserOption(option =>
			option
				.setName('user')
				.setDescription('The user you want to mute')
				.setRequired(true)),

	async execute(interaction, guild) {
		const userProvidedInInteraction = interaction.options.getUser('user');
		const user = await interaction.client.guilds.cache.get(interaction.guild.id).members.fetch(userProvidedInInteraction.id);
		
		if (!interaction.member.permissions.has('KICK_MEMBERS') || !interaction.member.permissions.has('BAN_MEMBERS')) return await interaction.reply(new Embed({
			description: Constants.USER_LACKING_PERMISSIONS.replace('{{action}}', 'unmute'),
			ephemeral: true
		}).Error);
		
		if (!user) return await interaction.reply(new Embed({
			description: Constants.USER_PROCESSING_ERROR,
			ephemeral: true
		}).Error);
		
		if (user.communicationDisabledUntil === null) return await interaction.reply(new Embed({
			description: Constants.UNMUTE_NOT_MUTED.replace('{{user}}', user),
			ephemeral: true
		}).Error);
					
		if (user.user.bot) return await interaction.reply(new Embed({
			description: Constants.BOT_IMMUNITY.replace('{{action}}', 'unmute'),
			ephemeral: true
		}).Error);

		if (!interaction.guild.me.permissions.has("MODERATE_MEMBERS")) return await interaction.reply(new Embed({
			description: Constants.SELF_LACKING_PERMISSIONS.replace('{{permission}}', 'MODERATE_MEMBERS'),
			ephemeral: true
		}).Error)

		if (!user.moderatable) return await interaction.reply(new Embed({
			description: Constants.BOT_LACKING_PERMISSIONS.replace('{{action}}', 'unmute'),
			ephemeral: true
		}).Error);

		if (interaction.member.roles.highest.position <= user.roles.highest.position) return await interaction.reply(new Embed({
			description: `${Constants.USER_ROLE_IMBALANCE.replace('{{action}}', 'unmute')} ${((interaction.member.roles.highest.position === user.roles.highest.position) ? Constants.USER_ROLE_IMBALANCE_SAME_ROLE : Constants.USER_ROLE_IMBALANCE_HIGHER_ROLE)}`,
			ephemeral: true
		}).Error);


		await user.timeout(null);
		await interaction.reply(new Embed({ 
			description: `Unmuted ${user}.`, ephemeral: false 
		}).Success);
	},
}