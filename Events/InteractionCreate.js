const Embed = require('../Modules/Embed');
const Guild = require('../Modules/Guild');
const Constants = require('../Modules/Constants');

module.exports = {
	name: 'interactionCreate',
	once: false,
	async execute(interaction) {
		if (!interaction.isCommand()) return;
		const command = interaction.client.commands.get(interaction.commandName);
		if (!command) return;

		const guild = new Guild(interaction.guild.id);

		const canRunCommand = await guild.Onboarding();
		if (!canRunCommand) return await interaction.reply(new Embed({ description: Constants.GUILD_BLACKLISTED }).Info);

		const isAdmin = interaction.member.permissions.has('ADMINISTRATOR');

		if (!await guild.ModuleEnabled(command.module)) return await interaction.reply(new Embed({
			description: isAdmin ? Constants.MODULE_NOT_ENABLED_ADMIN.replace('{{module}}', command.module.toLowerCase()) : Constants.MODULE_NOT_ENABLED_USER,
			ephemeral: true
		}).Info);
		
		try {
			await command.execute(interaction, guild);
		} catch (error) {
			console.error(error);
			await interaction.reply(new Embed({ 
				description: Constants.ERROR_OCCURED,
				ephemeral: true 
			}).Error);
		}
	},
};
