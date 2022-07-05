const { MessageEmbed } = require('discord.js');
const Constants = require('./constants');

class Embed {
	constructor(content) {
		this.title = content.title;
		this.description = content.description;
		this.author = content.author;
		this.fields = content.fields;
		this.footer = content.footer;
		this.timestamp = content.timestamp;
		this.ephemeral = content.ephemeral;
		this.components = content.components;
		this.fetchReply = content.fetchReply;
	}

	get Error() {
		return this.generateEmbed(Constants.ERROR_COLOUR, Constants.ERROR_EMOJI);
	}

	get Warning() {
		return this.generateEmbed(Constants.WARNING_COLOUR, Constants.WARNING_EMOJI);
	}

	get Info() {
		return this.generateEmbed(Constants.INFO_COLOUR, Constants.INFO_EMOJI);
	}
	
	get Success() {
		return this.generateEmbed(Constants.SUCCESS_COLOUR, Constants.SUCCESS_EMOJI);
	}

	get Regular() {
		return this.generateEmbed(Constants.REGULAR_COLOUR);
	}
	
	generateEmbed(colour, stateEmoji = undefined) {
		const body = new MessageEmbed();
		body.setColor(colour)
		if (stateEmoji === undefined) body.setDescription(this.description);
		else body.setDescription(`${stateEmoji} ${this.description}`);
		if (this.title !== undefined) body.setTitle(this.title);
		if (this.fields !== undefined) body.addFields(this.fields);
		if (this.author !== undefined) body.setAuthor({ name: this.author.name, iconURL: this.author.iconURL });
		if (this.footer !== undefined) body.setFooter({ text: this.footer });
		if (this.timestamp === true) body.setTimestamp()
		if (this.components !== undefined) return {
			embeds: [body],
			ephemeral: this.ephemeral || null,
			components: [this.components],
		}
		return {
			embeds: [body],
			ephemeral: this.ephemeral || null,
		};
	}

	get Pagination() {
		return this.generatePaginationEmbed(Constants.REGULAR_COLOUR);
	}

	generatePaginationEmbed(colour, stateEmoji = undefined) {
		const body = new MessageEmbed();
		body.setColor(colour)
		if (stateEmoji === undefined) body.setDescription(this.description);
		else body.setDescription(`${stateEmoji} ${this.description}`);
		if (this.fields !== undefined) body.addFields(this.fields);
		if (this.footer !== undefined) body.setFooter({ text: this.footer });
		if (this.timestamp === true) body.setTimestamp()
		return body;
		// FIXME: MAKE THIS LESS OF A MESS
	}
}

module.exports = Embed;
