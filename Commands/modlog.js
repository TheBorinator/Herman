const { SlashCommandBuilder } = require('@discordjs/builders');
const Constants = require('../Modules/Constants');
const Embed = require('../Modules/Embed');
const ModLog = require('../Modules/ModLog');
const PaginatedEmbed = require('../Modules/PaginatedEmbed');
const paginate = require('jw-paginate');

const itemsPerPage = 3;

module.exports = {
	module: 'Moderation',
	data: new SlashCommandBuilder()
		.setName('modlog')
		.setDescription(`Lists or manage user's past punishments`)
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription(`Lists a user's past punishments`)
				.addUserOption(option => 
					option
						.setName('user')
						.setDescription('The user in question')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('edit')
				.setDescription(`Edit a mod log from a user's history`)
				.addUserOption(option => 
					option
						.setName('user')
						.setDescription(`The user in question`)
						.setRequired(true))
				.addNumberOption(option => 
					option
						.setName('case-number')
						.setDescription(`The mod log case number`)
						.setRequired(true))
				.addStringOption(option => 
					option
						.setName('updated-reason')
						.setDescription(`The updated reason`)
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('remove')
				.setDescription(`Remove a mod log from a user's history`)
				.addUserOption(option => 
					option
						.setName('user')
						.setDescription(`The user in question`)
						.setRequired(true))
				.addNumberOption(option => 
					option
						.setName('case-number')
						.setDescription(`The mod log case number`)
						.setRequired(true))),

	async execute(interaction, guild) {
		if (interaction.options.getSubcommand() === 'list') {
			const userProvidedInInteraction = interaction.options.getUser('user');
			const user = await interaction.client.guilds.cache.get(interaction.guild.id).members.fetch(userProvidedInInteraction.id);

			if (!interaction.member.permissions.has('KICK_MEMBERS') || !interaction.member.permissions.has('BAN_MEMBERS')) return await interaction.reply(new Embed({
				description: Constants.USER_LACKING_PERMISSIONS.replace('{{action}}', 'read the modlogs of'),
				ephemeral: true
			}).Error);

			if (!user) return await interaction.reply(new Embed({
				description: Constants.USER_PROCESSING_ERROR,
				ephemeral: true
			}).Error);

			if (user.user.bot) return await interaction.reply(new Embed({
				description: Constants.BOT_IMMUNITY.replace('{{action}}', 'list the modlogs of'),
				ephemeral: true
			}).Error);

			if (interaction.member.roles.highest.position <= user.roles.highest.position || !interaction.member.id === user.id) return await interaction.reply(new Embed({
				description: `${Constants.USER_ROLE_IMBALANCE.replace('{{action}}', 'edit the modlogs of')} ${((interaction.member.roles.highest.position === user.roles.highest.position) ? Constants.USER_ROLE_IMBALANCE_SAME_ROLE : Constants.USER_ROLE_IMBALANCE_HIGHER_ROLE)}`,
				ephemeral: true
			}).Error);

			const events = await new ModLog().GetModLogs(interaction.guild.id, user.id);

			if (events.length == 0) return await interaction.reply(new Embed({ 
				description: `<@${user.id}> has no recorded punishments in this server.`, ephemeral: false 
			}).Info);

			let pages = [];

			let totalPages = paginate(events.length, 1, itemsPerPage).totalPages;
			for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
				let fieldsArray = [];
				let pagination = paginate(events.length, pageIndex + 1, itemsPerPage);
				for (let index = pagination.startIndex; index <= pagination.endIndex; index++) {
					let timestamp = Math.round(Date.parse(events[index].performedAt) / 1000);
					let title = `Case ${events[index].guildCaseId}`;
					let body = `${events[index].type}\n${(events[index].moderatorId == 'Automatic' ? 'Issued automatically' : `Issued by <@${events[index].moderatorId}>`)}\nReason: ${events[index].reason}\n<t:${timestamp}:F>`;
					if (events[index].editedBy != 'null') body += `\n*Last edited by <@${events[index].editedBy}>, <t:${Math.round(Date.parse(events[index].updatedAt) / 1000)}:F>*`
					fieldsArray.push({
						name: title,
						value: body
					});
				}

				pages.push(new Embed({ description: `<@${user.id}>'s punishment history (${user.id})`, fields: fieldsArray }).Pagination);
			}

			await PaginatedEmbed(interaction, pages);
		}

		if (interaction.options.getSubcommand() === 'edit') {
			if (!interaction.member.permissions.has('KICK_MEMBERS') || !interaction.member.permissions.has('BAN_MEMBERS')) return await interaction.reply(new Embed({
				description: Constants.USER_LACKING_PERMISSIONS.replace('{{action}}', 'edit the modlogs of'),
				ephemeral: true
			}).Error);

			const userProvidedInInteraction = interaction.options.getUser('user');
			const user = await interaction.client.guilds.cache.get(interaction.guild.id).members.fetch(userProvidedInInteraction.id);
			const caseNumber = interaction.options.getNumber('case-number');
			const updatedReason = interaction.options.getString('updated-reason');

			if (!user) return await interaction.reply(new Embed({
				description: Constants.USER_PROCESSING_ERROR,
				ephemeral: true
			}).Error);

			if (interaction.member.id === user.id) return await interaction.reply(new Embed({
				description: Constants.MODLOG_CANNOT_ACTION_OWN_LOGS.replace('{{action}}', 'edit'),
				ephemeral: true
			}));

			if (interaction.member.roles.highest.position <= user.roles.highest.position) return await interaction.reply(new Embed({
				description: `${Constants.USER_ROLE_IMBALANCE.replace('{{action}}', 'edit the modlogs of')} ${((interaction.member.roles.highest.position === user.roles.highest.position) ? Constants.USER_ROLE_IMBALANCE_SAME_ROLE : Constants.USER_ROLE_IMBALANCE_HIGHER_ROLE)}`,
				ephemeral: true
			}).Error);

			const events = await new ModLog().GetModLogs(interaction.guild.id, user.id);

			let arrayOfCaseNumbers = [];
			events.forEach(event => {
				if (!event.hidden) arrayOfCaseNumbers.push(event.guildCaseId);
			});

			if (!arrayOfCaseNumbers.includes(caseNumber)) return await interaction.reply(new Embed({
				description: Constants.MODLOG_INVALID_CASENUMBER.replace('{{user}}', user),
				ephemeral: true
			}).Error);

			if (updatedReason.length > 100) return await interaction.reply(new Embed({
				description: Constants.REASON_TOO_LONG,
				ephemeral: true
			}).Error);

			await new ModLog().UpdateModLog(interaction.guild.id, interaction.member.id, caseNumber, updatedReason, false, interaction.member);
			await interaction.reply(new Embed({ 
				description: Constants.MODLOG_EDIT_SUCCESS.replace('{{case}}', caseNumber).replace('{{reason}}', updatedReason), ephemeral: false 
			}).Success);
		}

		if (interaction.options.getSubcommand() === 'remove') {
			if (!interaction.member.permissions.has('KICK_MEMBERS') || !interaction.member.permissions.has('BAN_MEMBERS')) return await interaction.reply(new Embed({
				description: Constants.USER_LACKING_PERMISSIONS.replace('{{action}}', 'remove a modlog that involves'),
				ephemeral: true
			}).Error);

			const userProvidedInInteraction = interaction.options.getUser('user');
			const user = await interaction.client.guilds.cache.get(interaction.guild.id).members.fetch(userProvidedInInteraction.id);
			const caseNumber = interaction.options.getNumber('case-number');

			if (!user) return await interaction.reply(new Embed({
				description: Constants.USER_PROCESSING_ERROR,
				ephemeral: true
			}).Error);

			if (interaction.member.id === user.id) return await interaction.reply(new Embed({
				description: Constants.MODLOG_CANNOT_ACTION_OWN_LOGS.replace('{{action}}', 'remove'),
				ephemeral: true
			}))

			if (interaction.member.roles.highest.position <= user.roles.highest.position) return await interaction.reply(new Embed({
				description: `${Constants.USER_ROLE_IMBALANCE.replace('{{action}}', 'remove a modlog that involves')} ${((interaction.member.roles.highest.position === user.roles.highest.position) ? Constants.USER_ROLE_IMBALANCE_SAME_ROLE : Constants.USER_ROLE_IMBALANCE_HIGHER_ROLE)}`,
				ephemeral: true
			}).Error);

			const events = await new ModLog().GetModLogs(interaction.guild.id, user.id);

			let arrayOfCaseNumbers = [];
			events.forEach(event => {
				if (!event.hidden) arrayOfCaseNumbers.push(event.guildCaseId);
			});

			if (!arrayOfCaseNumbers.includes(caseNumber)) return await interaction.reply(new Embed({
				description: Constants.MODLOG_INVALID_CASENUMBER.replace('{{user}}', user),
				ephemeral: true
			}).Error);
			await new ModLog().UpdateModLog(interaction.guild.id, interaction.member.id, caseNumber, null, true, interaction.member);
			await interaction.reply(new Embed({ 
				description: Constants.MODLOG_REMOVE_SUCCESS.replace('{{case}}', caseNumber).replace('{{user}}', user), ephemeral: false 
			}).Success);
		}
	}
}