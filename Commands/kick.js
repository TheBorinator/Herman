const { SlashCommandBuilder } = require('@discordjs/builders');
const Constants = require('../Modules/Constants');
const Embed = require('../Modules/Embed');
const ModLog = require('../Modules/ModLog');

module.exports = {
	module: 'Moderation',
	data: new SlashCommandBuilder()
		.setName('kick')
		.setDescription('Kicks a user with a reason')
		.addUserOption(option =>
			option
				.setName('user')
				.setDescription('The user you want to kick')
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName('reason')
				.setDescription('Your reason for kicking the user')
				.setRequired(true)),

	async execute(interaction, guild) {
		const userProvidedInInteraction = interaction.options.getUser('user');
		const user = await interaction.client.guilds.cache.get(interaction.guild.id).members.fetch(userProvidedInInteraction.id);
		const reason = interaction.options.getString('reason');

		if (!interaction.member.permissions.has('KICK_MEMBERS')) return await interaction.reply(new Embed({ 
			description: Constants.USER_LACKING_PERMISSIONS.replace('{{action}}', 'kick'), 
			ephemeral: true 
		}).Error);

		if (!user) return await interaction.reply(new Embed({ 
			description: Constants.USER_PROCESSING_ERROR, 
			ephemeral: true 
		}).Error);

		if (user.user.bot) return await interaction.reply(new Embed({
			description: Constants.BOT_IMMUNITY.replace('{{action}}', 'kick'),
			ephemeral: true
		}).Error);

		if (!interaction.guild.me.permissions.has("KICK_MEMBERS")) return await interaction.reply(new Embed({
			description: Constants.SELF_LACKING_PERMISSIONS.replace('{{permission}}', 'KICK_MEMBERS'),
			ephemeral: true
		}).Error)

		if (!user.kickable) return await interaction.reply(new Embed({ 
			description: Constants.BOT_LACKING_PERMISSIONS.replace('{{action}}', 'kick'), 
			ephemeral: true 
		}).Error);

		if (interaction.member.roles.highest.position <= user.roles.highest.position) return await interaction.reply(new Embed({ 
			description: `${Constants.USER_ROLE_IMBALANCE.replace('{{action}}', 'kick')} ${((interaction.member.roles.highest.position === user.roles.highest.position) ? Constants.USER_ROLE_IMBALANCE_SAME_ROLE : Constants.USER_ROLE_IMBALANCE_HIGHER_ROLE)}`, 
			ephemeral: true 
		}).Error);

		if (reason.length > 100) return await interaction.reply(new Embed({
			description: Constants.REASON_TOO_LONG,
			ephemeral: true
		}).Error);

		await user.send(new Embed({ 
			description: Constants.DISRUPTIVE_PUNISHMENT_DM.replace('{{action}}', 'kicked').replace('{{guild}}', interaction.guild.name).replace('{{reason}}', reason) 
		}).Warning).catch(e => null);
		await user.kick(reason);
		await new ModLog().CreateModLog(interaction.guild.id, user.id, interaction.member.id, 'Kick', reason, interaction.member.guild);
		await interaction.reply(new Embed({ 
			description: Constants.DISRUPTIVE_PUNISHMENT_PUBLIC_MESSAGE.replace('{{action}}', 'Kicked').replace('{{user}}', user).replace('{{reason}}', reason), ephemeral: false 
		}).Success);
	},
}