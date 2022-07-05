const Guild = require('../Modules/Guild');
const ModLog = require('../Modules/ModLog');
const Embed = require('../Modules/Embed');
const Constants = require('../Modules/Constants');
const prettyMS = require('pretty-ms');

module.exports = {
	name: 'messageCreate',
	once: false,
	async execute(message) {
		const guild = new Guild(message.guild.id);
		const canRunCommand = await guild.Onboarding();
		if (!canRunCommand) return;
		const bannedPhrases = await guild.BannedPhrases;
		if (bannedPhrases == null) return;

		const isBannedPhrase = (phrase => message.content.toLowerCase().replace(/\W/g, '').includes(phrase.phrase.toLowerCase().replace(/\W/g, '')))
		if (bannedPhrases.some(isBannedPhrase)) {
			const bannedPhraseIndex = bannedPhrases.findIndex(isBannedPhrase);
			let reason = 'using a banned phrase.';
			switch (bannedPhrases[bannedPhraseIndex].action) {
				case 'DELETE':
					await message.delete().catch(e => null);
					let warningMessage = await message.channel.send(new Embed({
						description: Constants.BANNED_PHRASE.replace('{{user}}', message.author),
					}).Warning);
					setTimeout(() => {
						warningMessage.delete().catch(e => null);
					}, 1000);
					break;
				case 'WARN':
					await message.delete().catch(e => null);
					await message.author.send(new Embed({ 
						description: Constants.NONDISRUPTIVE_PUNISHMENT_DM.replace('{{action}}', 'warned').replace('{{guild}}', message.guild.name).replace('{{reason}}', reason) 
					}).Warning).catch(e => null);
					await new ModLog().CreateModLog(message.guild.id, message.author.id, 'Automatic', 'Warning', reason, message.guild);
					await message.channel.send(new Embed({ 
						description: Constants.NONDISRUPTIVE_PUNISHMENT_PUBLIC_MESSAGE.replace('{{action}}', 'Warned').replace('{{user}}', message.author).replace('{{reason}}', reason)
					}).Success);
					break;
				case 'MUTE':
					const duration = (+bannedPhrases[bannedPhraseIndex].actionContext == null ? 30 * 60 * 1000 : +bannedPhrases[bannedPhraseIndex].actionContext * 60 * 1000)
					const prettyDuration = prettyMS(duration, { verbose: true });
					await message.delete().catch(e => null);
					await message.author.send(new Embed({ 
						description: Constants.NONDISRUPTIVE_PUNISHMENT_DM.replace('{{action}}', 'muted').replace('{{guild}}', message.guild.name).replace('{{reason}}', reason) 
					}).Warning).catch(e => null);
					await message.member.timeout(duration, reason).catch(e => null);
					await new ModLog().CreateModLog(message.guild.id, message.author.id, 'Automatic', 'Mute', reason, message.guild);
					await message.channel.send(new Embed({ 
						description: Constants.MUTE_PUBLIC_MESSAGE.replace('{{action}}', 'Muted').replace('{{user}}', message.author).replace('{{duration}}', prettyDuration).replace('{{reason}}', reason)
					}).Success);
					break;
				case 'BAN':
					await message.delete().catch(e => null);
					await message.author.send(new Embed({ 
						description: Constants.DISRUPTIVE_PUNISHMENT_DM.replace('{{action}}', 'banned').replace('{{guild}}', message.guild.name).replace('{{reason}}', reason) 
					}).Warning).catch(e => null);
					await message.member.ban({ reason: reason }).catch(e => null);
					await new ModLog().CreateModLog(message.guild.id, message.author.id, 'Automatic', 'Ban', reason, message.guild);
					await message.channel.send(new Embed({ 
						description: Constants.DISRUPTIVE_PUNISHMENT_PUBLIC_MESSAGE.replace('{{action}}', 'Banned').replace('{{user}}', message.author).replace('{{reason}}', reason)
					}).Success);
					break;
			}

		}
	},
};