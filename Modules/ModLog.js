const Bottleneck = require("bottleneck/es5");
const Prisma = require('./DB');
const Guild = require('./Guild');
const Embed = require('./Embed');

const limiter = new Bottleneck({
	minTime: 333
});

class ModLog {
	async CreateModLog(guildId, userId, moderatorId, type, reason, guild) {
		limiter.schedule(async () => {
			const caseIdQuery = await Prisma.modLog.findMany({
				where: {
					guildId: guildId
				},
				select: {
					guildCaseId: true
				},
				orderBy: {
					guildCaseId: 'desc'
				},
				take: 1
			});
		
			let caseId = (caseIdQuery[0]?.guildCaseId ?? 0) + 1; // If there are no previous CaseIDs, then return 0 & increment it by 1
	
			const preferences = await new Guild(guildId).OnModLogPreferences;
	
			const issuedAutomatically = (moderatorId === 'Automatic');
			
			if (preferences[`include${type}`]) {
				const modLogChannel = await guild.channels.cache.get(preferences.channelId);
				if (modLogChannel != undefined) await modLogChannel.send(new Embed({ 
					description: `**Case ${caseId}**\n${type}\nIssued to <@${userId}>\n${(issuedAutomatically ? 'Issued automatically' : `Issued by <@${moderatorId}>`)}\nReason: ${reason}`,
					timestamp: true
				}).Regular);
			}
			
			return await Prisma.modLog.create({
				data: {
					guildCaseId: caseId,
					guildId: guildId,
					userId: userId,
					moderatorId: moderatorId,
					type: type,
					reason: reason
				},
			});
		});
	}

	async GetModLogs(guildId, userId) {
		return new Promise(async (resolve, reject) => {
			resolve(await Prisma.modLog.findMany({
				where: {
					guildId: guildId,
					userId: userId,
					hidden: false,
				},
				orderBy: {
					guildCaseId: "desc"
				}
			}));
		});
	}
	
	async UpdateModLog(guildId, moderatorId, caseNumber, reason, hidden, member) {
		return new Promise(async (resolve, reject) => {
			const preferences = await new Guild(guildId).OnModLogPreferences;

			if (preferences.pushOnEdit) {
				const previousReason = await Prisma.modLog.findMany({
					where: {
						guildId: guildId,
						guildCaseId: caseNumber
					},
					select: {
						reason: true,
						moderatorId: true,
					}
				});

				const modLogChannel = await member.guild.channels.cache.get(preferences.channelId);
				if (modLogChannel != undefined) await modLogChannel.send(new Embed({
					description: `**Case ${caseNumber}**\n${((reason === null) ? 'Removed' : 'Edited')} by <@${moderatorId}>\n${((previousReason[0].moderatorId === 'Automatic') ? `Originally issued automatically` : `Originally issued by <@${previousReason[0].moderatorId}>`)}\nPrevious reason: ${previousReason[0].reason}${((reason === null) ? '' : `\nUpdated reason: ${reason}`)}`,
					timestamp: true
				}).Regular);
			}
			
			if (reason !== null) {
				resolve(await Prisma.modLog.updateMany({
					where: {
						guildCaseId: caseNumber,
						hidden: false,
						AND: {
							guildId: guildId,
						}
					},
					data: {
						reason: reason,
						editedBy: moderatorId
					}
				}));
			}
			else {
				resolve(await Prisma.modLog.updateMany({
					where: {
						guildCaseId: caseNumber,
						AND: {
							guildId: guildId,
						}
					},
					data: {
						hidden: hidden,
						editedBy: moderatorId
					}
				}));
			}
		});
	}
}

module.exports = ModLog