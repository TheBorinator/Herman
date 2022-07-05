const { SlashCommandBuilder } = require('@discordjs/builders');
const Constants = require('../Modules/Constants');
const Embed = require('../Modules/Embed');
const ModLog = require('../Modules/ModLog');
const parseTime = require('parse-duration').default;
const prettyMS = require('pretty-ms');
const ms = require('ms');

module.exports = {
	module: 'Moderation',
	data: new SlashCommandBuilder()
		.setName('mute')
		.setDescription('Mute a user with a reason')
		.addUserOption(option =>
			option
				.setName('user')
				.setDescription('The user you want to mute')
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName('duration')
				.setDescription('The duration of the mute')
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName('reason')
				.setDescription('Your reason for muting the user')
				.setRequired(true)),

	async execute(interaction, guild) {
		const userProvidedInInteraction = interaction.options.getUser('user');
		const user = await interaction.client.guilds.cache.get(interaction.guild.id).members.fetch(userProvidedInInteraction.id);
		const duration = interaction.options.getString('duration');
		const reason = interaction.options.getString('reason');

		if (!interaction.member.permissions.has('KICK_MEMBERS') || !interaction.member.permissions.has('BAN_MEMBERS')) return await interaction.reply(new Embed({
			description: Constants.USER_LACKING_PERMISSIONS.replace('{{action}}', 'mute'),
			ephemeral: true
		}).Error);

		if (!user) return await interaction.reply(new Embed({
			description: Constants.USER_PROCESSING_ERROR,
			ephemeral: true
		}).Error);

		if (user.communicationDisabledUntil !== null) return await interaction.reply(new Embed({
			description: Constants.MUTE_ALREADY_MUTED.replace('{{user}}', user).replace('{{time}}', user.communicationDisabledUntil),
			ephemeral: true
		}).Error);

		if (user.user.bot) return await interaction.reply(new Embed({
			description: Constants.BOT_IMMUNITY.replace('{{action}}', 'mute'),
			ephemeral: true
		}).Error);

		if (!interaction.guild.me.permissions.has("MODERATE_MEMBERS")) return await interaction.reply(new Embed({
			description: Constants.SELF_LACKING_PERMISSIONS.replace('{{permission}}', 'MODERATE_MEMBERS'),
			ephemeral: true
		}).Error)

		if (!user.moderatable) return await interaction.reply(new Embed({
			description: Constants.BOT_LACKING_PERMISSIONS.replace('{{action}}', 'mute'),
			ephemeral: true
		}).Error);

		if (interaction.member.roles.highest.position <= user.roles.highest.position) return await interaction.reply(new Embed({
			description: `${Constants.USER_ROLE_IMBALANCE.replace('{{action}}', 'mute')} ${((interaction.member.roles.highest.position === user.roles.highest.position) ? Constants.USER_ROLE_IMBALANCE_SAME_ROLE : Constants.USER_ROLE_IMBALANCE_HIGHER_ROLE)}`,
			ephemeral: true
		}).Error);

		const parsedTime = parseTime(duration);
		if (parsedTime < ms('1m') || parsedTime > ms('28d')) return await interaction.reply(new Embed({
			description: `${Constants.INVALID_TIME_RANGE} ${((parsedTime > ms('28d')) ? Constants.INVALID_TIME_RANGE_TOO_HIGH : Constants.INVALID_TIME_RANGE_TOO_LOW)}`,
			ephemeral: true
		}).Error);

		const prettyDuration = prettyMS(parsedTime, { verbose: true });

		await user.send(new Embed({ 
			description: Constants.NONDISRUPTIVE_PUNISHMENT_DM.replace('{{action}}', 'muted').replace('{{guild}}', interaction.guild.name).replace('{{reason}}', reason) 
		}).Warning).catch(e => null);
		await user.timeout(parsedTime, reason).catch(e => null);
		await new ModLog().CreateModLog(interaction.guild.id, user.id, interaction.member.id, 'Mute', reason, interaction.member.guild);
		await interaction.reply(new Embed({ 
			description: Constants.MUTE_PUBLIC_MESSAGE.replace('{{action}}', 'Muted').replace('{{user}}', user).replace('{{duration}}', prettyDuration).replace('{{reason}}', reason), ephemeral: false 
		}).Success);
	},
}