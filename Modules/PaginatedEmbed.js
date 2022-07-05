const {
	Message,
	MessageActionRow,
	MessageEmbed,
	MessageButton,
} = require("discord.js");
const Embed = require('./Embed');
const Constants = require('./Constants');

const PaginatedEmbed = async (
	interaction,
	pages,
	timeout = 120000
) => {
	if (!pages) throw new Error("Pages are not given.");

	let buttonList = [
		new MessageButton()
			.setCustomId('previousbtn')
			.setLabel('Previous')
			.setStyle('DANGER'),
		new MessageButton()
			.setCustomId('nextbtn')
			.setLabel('Next')
			.setStyle('SUCCESS')
	];

	let disabledButtonList = [
		new MessageButton()
			.setCustomId('previousbtn')
			.setLabel('Previous')
			.setStyle('DANGER')
			.setDisabled(true),
		new MessageButton()
			.setCustomId('nextbtn')
			.setLabel('Next')
			.setStyle('SUCCESS')
			.setDisabled(true)
	];

	let page = 0;

	const row = new MessageActionRow().addComponents(buttonList);
	const disabledRow = new MessageActionRow().addComponents(disabledButtonList);

	if (interaction.deferred == false) await interaction.deferReply();

	const curPage = await interaction.editReply({
		embeds: [pages[page].setFooter({ text: `Page ${page + 1} of ${pages.length}` })],
		components: [pages.length < 1 ? disabledRow : row],
		fetchReply: true,
	});

	const filter = (i) =>
		i.customId === buttonList[0].customId ||
		i.customId === buttonList[1].customId;

	const collector = await curPage.createMessageComponentCollector({
		filter,
		time: timeout,
	});

	collector.on("collect", async (i) => {
		if (i.user.id !== interaction.user.id) {
			await i.reply(new Embed({ description: Constants.INVALID_BUTTON_USER, ephemeral: true }).Error);
			return;
		};
		switch (i.customId) {
			case buttonList[0].customId:
				page = page > 0 ? --page : pages.length - 1;
				break;
			case buttonList[1].customId:
				page = page + 1 < pages.length ? ++page : 0;
				break;
			default:
				break;
		}
		await i.deferUpdate();
		await i.editReply({
			embeds: [pages[page].setFooter({ text: `Page ${page + 1} of ${pages.length}` })],
			components: [row],
		});
		collector.resetTimer();
	});

	collector.on("end", (_, reason) => {
		if (reason !== "messageDelete") {
			const disabledRow = new MessageActionRow().addComponents(disabledButtonList);
			curPage.edit({
				embeds: [pages[page].setFooter({ text: `Page ${page + 1} of ${pages.length}` })],
				components: [disabledRow],
			});
		}
	});

	return curPage;
};
module.exports = PaginatedEmbed;