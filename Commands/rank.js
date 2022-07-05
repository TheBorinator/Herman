const { SlashCommandBuilder } = require('@discordjs/builders');
const Constants = require('../Modules/Constants');
const Embed = require('../Modules/Embed');

module.exports = {
	module: 'Ranks',
	data: new SlashCommandBuilder()
		.setName('rank')
		.setDescription('Join, create or remove a rank')
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription(`List the ranks available to you`))
		.addSubcommand(subcommand =>
			subcommand
				.setName('join')
				.setDescription(`Join a rank`)
				.addStringOption(option => 
					option
						.setName('name')
						.setDescription('The name of the rank')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('leave')
				.setDescription(`Leave a rank`)
				.addStringOption(option => 
					option
						.setName('name')
						.setDescription('The name of the rank')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('create')
				.setDescription(`Create a joinable rank`)
				.addRoleOption(option => 
					option
						.setName('role')
						.setDescription(`The role that will be assigned`)
						.setRequired(true))
				.addStringOption(option => 
					option
						.setName('name')
						.setDescription(`The text that users will use to get the rank`)
						.setRequired(true))
				.addRoleOption(option => 
					option
						.setName('prerequisite')
						.setDescription(`The role you need to be able to join the rank`)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('remove')
				.setDescription(`Remove a rank`)
				.addStringOption(option => 
					option
						.setName('name')
						.setDescription(`The name of the rank that will be deleted`)
						.setRequired(true))),

	async execute(interaction, guild) {
		if (interaction.options.getSubcommand() === 'list') {
			const preferences = await guild.JoinableRankPreferences;

			const user = await interaction.client.guilds.cache.get(interaction.guild.id).members.fetch(interaction.member.id);

			if (preferences === null) return await interaction.reply(new Embed({
				description: Constants.RANK_GUILD_HAS_NO_RANKS,
				ephemeral: true
			}).Info);

			const canManageRoles = user.permissions.has('MANAGE_ROLES');

			let fieldsArray = [];
			for (let joinableRank of preferences) {
				const role = await interaction.guild.roles.cache.get(joinableRank.roleId);
				if (user.roles.cache.has(joinableRank.prerequisiteRoleId) || joinableRank.prerequisiteRoleId === 'null' || canManageRoles) fieldsArray.push({ 
					name: `Rank: \`${joinableRank.name}\``,
					value: `Yields: ${role}`,
				});
			}

			if (fieldsArray.length === 0) return await interaction.reply(new Embed({ 
				description: ((canManageRoles) ? Constants.RANK_MOD_GUILD_HAS_NO_RANKS : Constants.RANK_GUILD_HAS_NO_RANKS) ,
				ephemeral: true 
			}).Info);

			await interaction.reply(new Embed({ 
				description: ((canManageRoles) ? `${interaction.guild.name} rank list` : `Ranks that meet the prerequisites ${user} currently has`), 
				fields: fieldsArray, 
				ephemeral: false 
			}).Regular);
		}

		if (interaction.options.getSubcommand() === 'join') {
			const name = interaction.options.getString('name');

			const preferences = await guild.JoinableRankPreferences;

			const user = await interaction.client.guilds.cache.get(interaction.guild.id).members.fetch(interaction.member.id);

			if (preferences === null) return await interaction.reply(new Embed({
				description: Constants.RANK_GUILD_HAS_NO_RANKS,
				ephemeral: true
			}).Info);

			let arrayOfRankNames = [];
			for (let joinableRank of preferences) {
				arrayOfRankNames.push(joinableRank.name);
			}

			if (!arrayOfRankNames.includes(name.toLowerCase())) return await interaction.reply(new Embed({
				description: Constants.RANK_INVALID_RANK_NAME,
				ephemeral: true
			}).Error);

			let joinableRankInstanceIndex = null;
			for (let index = 0; index < preferences.length; index++) {
				if (preferences[index].name === name) {
					joinableRankInstanceIndex = index;
					break;
				}
			}
			
			if (joinableRankInstanceIndex === null) return await interaction.reply(new Embed({
				description: Constants.RANK_INVALID_RANK_NAME,
				ephemeral: true
			}).Error);
			
			const prerequisiteRoleId = preferences[joinableRankInstanceIndex].prerequisiteRoleId;
			if (prerequisiteRoleId !== 'null') {
				const prerequisiteRole = await interaction.guild.roles.cache.get(prerequisiteRoleId);
				if (!user.roles.cache.has(prerequisiteRoleId)) return await interaction.reply(new Embed({
					description: Constants.RANK_MISSING_PREREQUISITE_ROLE.replace('{{role}}', prerequisiteRole),
					ephemeral: true
				}).Error);
			}
	
			const roleId = preferences[joinableRankInstanceIndex].roleId;
			const role = await interaction.guild.roles.cache.get(roleId);
			if (role === undefined) return await interaction.reply(new Embed({
				description: Constants.RANK_ROLE_MISSING,
				ephemeral: true
			}).Error);
			
			if (user.roles.cache.has(roleId)) return await interaction.reply(new Embed({
				description: Constants.RANK_ALREADY_HAS_ROLE,
				ephemeral: true
			}).Error);

			if (!interaction.guild.me.permissions.has("MANAGE_ROLES")) return await interaction.reply(new Embed({
				description: Constants.SELF_LACKING_PERMISSIONS.replace('{{permission}}', 'MANAGE_ROLES'),
				ephemeral: true
			}).Error)

			if (!user.manageable || !role.editable) return await interaction.reply(new Embed({
				description: Constants.RANK_LACKING_PERMISSIONS,
				ephemeral: true
			}).Error);

			const rankName = preferences[joinableRankInstanceIndex].name;
			const confirmationMessagesEphemeral = preferences[joinableRankInstanceIndex].confirmationMessagesEphemeral;

			await user.roles.add(role)
			await interaction.reply(new Embed({
				description: Constants.RANK_ASSIGN_SUCCESS.replace('{{rank}}', rankName).replace('{{role}}', role),
				ephemeral: confirmationMessagesEphemeral
			}).Success);
		}

		if (interaction.options.getSubcommand() === 'leave') {
			const name = interaction.options.getString('name');

			const preferences = await guild.JoinableRankPreferences;

			const user = await interaction.client.guilds.cache.get(interaction.guild.id).members.fetch(interaction.member.id);

			if (preferences === null) return await interaction.reply(new Embed({
				description: Constants.RANK_GUILD_HAS_NO_RANKS,
				ephemeral: true
			}).Error);

			let arrayOfRankNames = [];
			for (let joinableRank of preferences) {
				arrayOfRankNames.push(joinableRank.name);
			}

			if (!arrayOfRankNames.includes(name.toLowerCase())) return await interaction.reply(new Embed({
				description: Constants.RANK_INVALID_RANK_NAME,
				ephemeral: true
			}).Error);

			let joinableRankInstanceIndex = null;
			for (let index = 0; index < preferences.length; index++) {
				if (preferences[index].name === name) {
					joinableRankInstanceIndex = index;
					break;
				}
			}

			if (joinableRankInstanceIndex === null) return await interaction.reply(new Embed({
				description: Constants.RANK_INVALID_RANK_NAME,
				ephemeral: true
			}).Error);

			const roleId = preferences[joinableRankInstanceIndex].roleId;
			const role = await interaction.guild.roles.cache.get(roleId);
			if (!user.roles.cache.has(roleId)) return await interaction.reply(new Embed({
				description: Constants.RANK_ROLE_PREVIOUSLY_REMOVED,
				ephemeral: true
			}).Error);

			if (!interaction.guild.me.permissions.has("MANAGE_ROLES")) return await interaction.reply(new Embed({
				description: Constants.SELF_LACKING_PERMISSIONS.replace('{{permission}}', 'MANAGE_ROLES'),
				ephemeral: true
			}).Error)

			if (!user.manageable || !role.editable) return await interaction.reply(new Embed({
				description: Constants.RANK_LACKING_PERMISSIONS,
				ephemeral: true
			}).Error);

			const rankName = preferences[joinableRankInstanceIndex].name;
			const confirmationMessagesEphemeral = preferences[joinableRankInstanceIndex].confirmationMessagesEphemeral;


			await user.roles.remove(role)
			await interaction.reply(new Embed({
				description: Constants.RANK_REMOVE_SUCCESS.replace('{{rank}}', rankName).replace('{{role}}', role),
				ephemeral: confirmationMessagesEphemeral
			}).Success);
		}

		if (interaction.options.getSubcommand() === 'create') {
			const role = interaction.options.getRole('role');
			const name = interaction.options.getString('name');
			const prerequisite = interaction.options.getRole('prerequisite');

			const preferences = await guild.JoinableRankPreferences;

			const user = await interaction.client.guilds.cache.get(interaction.guild.id).members.fetch(interaction.member.id);

			if (!user.permissions.has('MANAGE_ROLES')) return await interaction.reply(new Embed({
				description: Constants.RANK_USER_LACKING_PERMISSIONS,
				ephemeral: true
			}).Error);

			if (role.name === '@everyone') return await interaction.reply(new Embed({
				description: Constants.RANK_CANNOT_ASSIGN_EVERYONE,
				ephemeral: true
			}).Error);

			if (role.managed) return await interaction.reply(new Embed({
				description: Constants.RANK_ROLE_MANAGED_BY_INTEGRATION,
				ephemeral: true
			}).Error);

			if (prerequisite !== null) {
				if (role.id === prerequisite.id) return await interaction.reply(new Embed({
					description: Constants.RANK_CANNOT_BE_PREREQUISITE,
					ephemeral: true
				}).Error);
			}

			if (preferences !== null) {
				let arrayOfRankNames = [];
				let arrayOfRankRoleIds = [];
				for (let joinableRank of preferences) {
					arrayOfRankNames.push(joinableRank.name);
					arrayOfRankRoleIds.push(joinableRank.roleId);
				}
	
				if (arrayOfRankNames.includes(name.toLowerCase())) return await interaction.reply(new Embed({
					description: Constants.RANK_NAME_ALREADY_IN_USE.replace('{{name}}', name),
					ephemeral: true
				}).Error);

				if (arrayOfRankRoleIds.includes(role.id)) {
					return await interaction.reply(new Embed({
						description: Constants.RANK_ROLE_ALREADY_IN_USE.replace('{{name}}', arrayOfRankNames[arrayOfRankRoleIds.indexOf(role.id)]).replace('{{role}}', role),
						ephemeral: true
					}).Error);
				}

				if (arrayOfRankRoleIds.length >= Constants.MAXIMUM_NUMBER_OF_RANKS) {
					return await interaction.reply(new Embed({
						description: Constants.RANK_PASSED_MAXIMUM_NUMBER_OF_RANKS,
						ephemeral: true
					}).Error);
				}
			}


			if (interaction.member.roles.highest.position <= role.position) return await interaction.reply(new Embed({
				description: `${Constants.RANK_ROLE_IMBALANCE.replace('{{action}}', 'create').replace('{{role}}', role)} ${((interaction.member.roles.highest.position === role.position) ? Constants.RANK_ROLE_IMBALANCE_SAME_ROLE : Constants.RANK_ROLE_IMBALANCE_HIGHER_ROLE)}`,
				ephemeral: true
			}).Error);

			if (interaction.guild.me.roles.highest.position <= role.position) return await interaction.reply(new Embed({
				description: `${Constants.RANK_ROLE_IMBALANCE.replace('{{action}}', 'create').replace('{{role}}', role)} ${((interaction.member.roles.highest.position === role.position) ? Constants.RANK_SELF_ROLE_IMBALANCE_SAME_ROLE : Constants.RANK_SELF_ROLE_IMBALANCE_HIGHER_ROLE)}`,
				ephemeral: true
			}).Error);

			let prerequisiteId;
			if (prerequisite !== null) prerequisiteId = prerequisite.id;
			else prerequisiteId = undefined;

			await guild.CreateJoinableRankInstance(name, role.id, prerequisiteId, interaction.guild.id, false);
			await interaction.reply(new Embed({
				description: Constants.RANK_CREATE_SUCCESS.replace('{{name}}', name),
				ephemeral: false
			}).Success);
		}

		if (interaction.options.getSubcommand() === 'remove') {
			const name = interaction.options.getString('name');

			const preferences = await guild.JoinableRankPreferences;

			const user = await interaction.client.guilds.cache.get(interaction.guild.id).members.fetch(interaction.member.id);

			if (!user.permissions.has('MANAGE_ROLES')) return await interaction.reply(new Embed({
				description: Constants.RANK_USER_LACKING_PERMISSIONS,
				ephemeral: true
			}).Error);

			if (preferences !== null) {
				let arrayOfRankNames = [];
				let arrayOfRankRoleIds = [];
				for (let joinableRank of preferences) {
					arrayOfRankNames.push(joinableRank.name);
					arrayOfRankRoleIds.push(joinableRank.roleId);
				}

				if (!arrayOfRankNames.includes(name.toLowerCase())) return await interaction.reply(new Embed({
					description: Constants.RANK_INVALID_RANK_NAME,
					ephemeral: true
				}).Error);
			}

			let rankInstanceIndex = null;
			for (let index = 0; index < preferences.length; index++) {
				if (preferences[index].name === name) {
					rankInstanceIndex = index;
					break;
				}
			}

			const roleId = preferences[rankInstanceIndex].roleId;
			const role = await interaction.guild.roles.cache.get(roleId);

			if (interaction.member.roles.highest.position <= role.position) return await interaction.reply(new Embed({
				description: `${Constants.RANK_ROLE_IMBALANCE.replace('{{action}}', 'remove').replace('{{role}}', role)} ${((interaction.member.roles.highest.position === role.position) ? Constants.RANK_ROLE_IMBALANCE_SAME_ROLE : Constants.RANK_ROLE_IMBALANCE_HIGHER_ROLE)}`,
				ephemeral: true
			}).Error);

			await guild.HideRank(name, roleId);
			await interaction.reply(new Embed({
				description: Constants.RANK_REMOVE_SUCCESS.replace('{{name}}', name),
				ephemeral: false
			}).Success);
		}
	},
}