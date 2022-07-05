const { SlashCommandBuilder } = require('@discordjs/builders');
const Constants = require('../Modules/Constants');
const Embed = require('../Modules/Embed');

module.exports = {
	module: 'Moderation',
	data: new SlashCommandBuilder()
		.setName('purge')
		.setDescription('Delete messages en masse')
		.addNumberOption(option =>
			option
				.setName('number-of-messages')
				.setDescription('The number of messages you want to delete')
				.setRequired(true)),

	async execute(interaction, guild) {
		const numberOfMessages = interaction.options.getNumber('number-of-messages');

		if (!interaction.member.permissions.has('MANAGE_MESSAGES')) return await interaction.reply(new Embed({
			description: Constants.USER_LACKING_PERMISSIONS.replace('{{action}}', 'delete messages'),
			ephemeral: true
		}).Error);

		if (numberOfMessages < 1 || numberOfMessages > 100) return await interaction.reply(new Embed({
			description: Constants.PURGE_ERRONEOUS_INPUT,
			ephemeral: true
		}).Error);

		if (!interaction.guild.me.permissions.has("MANAGE_MESSAGES")) return await interaction.reply(new Embed({
			description: Constants.SELF_LACKING_PERMISSIONS.replace('{{permission}}', 'MANAGE_MESSAGES'),
			ephemeral: true
		}).Error)

		const messages = await interaction.channel.bulkDelete(numberOfMessages, true);
		if (messages.size > numberOfMessages) return await interaction.reply(new Embed({	
			description: Constants.PURGE_PUBLIC_MESSAGE_2_WEEK_LIMIT.replace('{{messages}}', messages.size).replace('{{channel}}', interaction.channel)
		}).Success);

		await interaction.reply(new Embed({	
			description: Constants.PURGE_PUBLIC_MESSAGE.replace('{{messages}}', messages.size).replace('{{channel}}', interaction.channel)
		}).Success);
	},
}
