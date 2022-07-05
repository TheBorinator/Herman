const { SlashCommandBuilder } = require('@discordjs/builders');
const Constants = require('../Modules/Constants');
const Embed = require('../Modules/Embed');

module.exports = {
	module: 'Autoroles',
	data: new SlashCommandBuilder()
		.setName('autorole')
		.setDescription('Create or remove roles assigned when a user joins the server')
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription(`List this server's automatically assigned roles`))
		.addSubcommand(subcommand =>
			subcommand
				.setName('create')
				.setDescription(`Create an automatically assigned role`)
				.addRoleOption(option => option.setName('role').setDescription('The role that will be assigned').setRequired(true))
				.addNumberOption(option => option.setName('delay').setDescription('The number of seconds to wait before assigning the role')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('edit')
				.setDescription(`Edit an automatically assigned role`)
				.addRoleOption(option => option.setName('role').setDescription('The role that will be assigned').setRequired(true))
				.addNumberOption(option => option.setName('delay').setDescription('The number of seconds to wait before assigning the role').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('remove')
				.setDescription(`Remove an automatically assigned role (does not delete the role)`)
				.addRoleOption(option => option.setName('role').setDescription('The role that will no longer be assigned').setRequired(true))),

	async execute(interaction, guild) {
		if (interaction.options.getSubcommand() === 'list') {
			const roles = await guild.AutoRoles;
			const user = await interaction.client.guilds.cache.get(interaction.guild.id).members.fetch(interaction.member.id);

			if (!user.permissions.has('MANAGE_ROLES')) return await interaction.reply(new Embed({
				description: Constants.USER_LACKING_PERMISSIONS.replace('{{permission}}', 'MANAGE_ROLES'),
				ephemeral: true
			}).Error);
			
			if (!roles.length) return await interaction.reply(new Embed({
				description: Constants.AUTOROLE_GUILD_HAS_NO_AUTOROLES,
				ephemeral: true
			}).Info);

			fields = [];
			for (const role of roles) {
				const guildRole = await interaction.guild.roles.fetch(role.roleId);
				if (guildRole === undefined) return fields.push({ 
						name: `Unknown Role`,
						value: `<@&${role.roleId}>\nDelay: ${role.delay} seconds`
					})
				fields.push({ 
					name: guildRole.name,
					value: `<@&${role.roleId}>\nDelay: ${role.delay} seconds`
				})
			}

			return await interaction.reply(new Embed({
				description: `${interaction.guild.name} autoroles`,
				fields				
			}).Regular)
		}

		if (interaction.options.getSubcommand() === 'create') {
			const roles = await guild.AutoRoles;
			const role = interaction.options.getRole('role');
			const delay = interaction.options.getNumber('delay');
			const user = await interaction.client.guilds.cache.get(interaction.guild.id).members.fetch(interaction.member.id);

			if (!user.permissions.has('MANAGE_ROLES')) return await interaction.reply(new Embed({
				description: Constants.USER_LACKING_PERMISSIONS.replace('{{permission}}', 'MANAGE_ROLES'),
				ephemeral: true
			}).Error);

			if (role.name === '@everyone') return await interaction.reply(new Embed({
				description: Constants.AUTOROLE_CANNOT_ASSIGN_EVERYONE,
				ephemeral: true
			}).Error);

			if (role.managed) return await interaction.reply(new Embed({
				description: Constants.AUTOROLE_ROLE_MANAGED_BY_INTEGRATION,
				ephemeral: true
			}).Error);

			if (delay < 0 || delay > 18000) return await interaction.reply(new Embed({
				description: Constants.AUTOROLE_DELAY_RANGE_ERROR,
				ephemeral: true
			}).Error);

			if (roles !== null) {
				let arrayOfRoleIds = [];
				for (const autoRole of roles) arrayOfRoleIds.push(autoRole.roleId)
	
				if (arrayOfRoleIds.includes(role.id)) {
					return await interaction.reply(new Embed({
						description: Constants.AUTOROLE_ROLE_ALREADY_IN_USE.replace('{{role}}', role),
						ephemeral: true
					}).Error);
				}

				if (arrayOfRoleIds.length >= Constants.MAXIMUM_NUMBER_OF_RANKS) {
					return await interaction.reply(new Embed({
						description: Constants.AUTOROLE_PASSED_MAXIMUM_NUMBER_OF_AUTOROLES,
						ephemeral: true
					}).Error);
				}
			}

			if (interaction.member.roles.highest.position <= role.position) return await interaction.reply(new Embed({
				description: `${Constants.AUTOROLE_ROLE_IMBALANCE.replace('{{action}}', 'create').replace('{{role}}', role)} ${((interaction.member.roles.highest.position === role.position) ? Constants.AUTOROLE_ROLE_IMBALANCE_SAME_ROLE : Constants.AUTOROLE_ROLE_IMBALANCE_HIGHER_ROLE)}`,
				ephemeral: true
			}).Error);

			if (interaction.guild.me.roles.highest.position <= role.position) return await interaction.reply(new Embed({
				description: `${Constants.AUTOROLE_ROLE_IMBALANCE.replace('{{action}}', 'create').replace('{{role}}', role)} ${((interaction.member.roles.highest.position === role.position) ? Constants.AUTOROLE_SELF_ROLE_IMBALANCE_SAME_ROLE : Constants.AUTOROLE_SELF_ROLE_IMBALANCE_HIGHER_ROLE)}`,
				ephemeral: true
			}).Error);

			await guild.CreateAutoRole(role.id, delay || 0);
			await interaction.reply(new Embed({
				description: Constants.AUTOROLE_CREATE_SUCCESS.replace('{{role}}', role).replace('{{delay}}', delay || 0)
			}).Success)
		}

		if (interaction.options.getSubcommand() === 'edit') {
			const roles = await guild.AutoRoles;
			const role = interaction.options.getRole('role');
			const delay = interaction.options.getNumber('delay');
			const user = await interaction.client.guilds.cache.get(interaction.guild.id).members.fetch(interaction.member.id);

			if (!user.permissions.has('MANAGE_ROLES')) return await interaction.reply(new Embed({
				description: Constants.USER_LACKING_PERMISSIONS.replace('{{permission}}', 'MANAGE_ROLES'),
				ephemeral: true
			}).Error);

			if (delay < 0 || delay > 18000) return await interaction.reply(new Embed({
				description: Constants.AUTOROLE_DELAY_RANGE_ERROR,
				ephemeral: true
			}).Error);

			let arrayOfRoleIds = [];
			for (const autoRole of roles) arrayOfRoleIds.push(autoRole.roleId)

			if (!arrayOfRoleIds.includes(role.id)) {
				return await interaction.reply(new Embed({
					description: Constants.AUTOROLE_DOES_NOT_EXIST.replace('{{role}}', role),
					ephemeral: true
				}).Error);
			}

			if (interaction.member.roles.highest.position <= role.position) return await interaction.reply(new Embed({
				description: `${Constants.AUTOROLE_ROLE_IMBALANCE.replace('{{action}}', 'edit').replace('{{role}}', role)} ${((interaction.member.roles.highest.position === role.position) ? Constants.AUTOROLE_ROLE_IMBALANCE_SAME_ROLE : Constants.AUTOROLE_ROLE_IMBALANCE_HIGHER_ROLE)}`,
				ephemeral: true
			}).Error);

			if (interaction.guild.me.roles.highest.position <= role.position) return await interaction.reply(new Embed({
				description: `${Constants.AUTOROLE_ROLE_IMBALANCE.replace('{{action}}', 'edit').replace('{{role}}', role)} ${((interaction.member.roles.highest.position === role.position) ? Constants.AUTOROLE_SELF_ROLE_IMBALANCE_SAME_ROLE : Constants.AUTOROLE_SELF_ROLE_IMBALANCE_HIGHER_ROLE)}`,
				ephemeral: true
			}).Error);

			await guild.EditAutoRole(role.id, delay || 0);
			await interaction.reply(new Embed({
				description: Constants.AUTOROLE_EDIT_SUCCESS.replace('{{role}}', role).replace('{{delay}}', delay || 0)
			}).Success)
		}

		if (interaction.options.getSubcommand() === 'remove') {
			const roles = await guild.AutoRoles;
			const role = interaction.options.getRole('role');
			const delay = interaction.options.getNumber('delay');
			const user = await interaction.client.guilds.cache.get(interaction.guild.id).members.fetch(interaction.member.id);

			if (!user.permissions.has('MANAGE_ROLES')) return await interaction.reply(new Embed({
				description: Constants.USER_LACKING_PERMISSIONS.replace('{{permission}}', 'MANAGE_ROLES'),
				ephemeral: true
			}).Error);

			if (delay < 0 || delay > 18000) return await interaction.reply(new Embed({
				description: Constants.AUTOROLE_DELAY_RANGE_ERROR,
				ephemeral: true
			}).Error);

			let arrayOfRoleIds = [];
			for (const autoRole of roles) arrayOfRoleIds.push(autoRole.roleId);

			if (!arrayOfRoleIds.includes(role.id)) {
				return await interaction.reply(new Embed({
					description: Constants.AUTOROLE_DOES_NOT_EXIST.replace('{{role}}', role),
					ephemeral: true
				}).Error);
			}

			if (interaction.member.roles.highest.position <= role.position) return await interaction.reply(new Embed({
				description: `${Constants.AUTOROLE_ROLE_IMBALANCE.replace('{{action}}', 'remove').replace('{{role}}', role)} ${((interaction.member.roles.highest.position === role.position) ? Constants.AUTOROLE_ROLE_IMBALANCE_SAME_ROLE : Constants.AUTOROLE_ROLE_IMBALANCE_HIGHER_ROLE)}`,
				ephemeral: true
			}).Error);

			if (interaction.guild.me.roles.highest.position <= role.position) return await interaction.reply(new Embed({
				description: `${Constants.AUTOROLE_ROLE_IMBALANCE.replace('{{action}}', 'remove').replace('{{role}}', role)} ${((interaction.member.roles.highest.position === role.position) ? Constants.AUTOROLE_SELF_ROLE_IMBALANCE_SAME_ROLE : Constants.AUTOROLE_SELF_ROLE_IMBALANCE_HIGHER_ROLE)}`,
				ephemeral: true
			}).Error);

			await guild.RemoveAutoRole(role.id);
			await interaction.reply(new Embed({
				description: Constants.AUTOROLE_REMOVE_SUCCESS.replace('{{role}}', role)
			}).Success);
		}
	}
};