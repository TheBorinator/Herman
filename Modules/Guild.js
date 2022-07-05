const Prisma = require('./DB');
const Cache = require('./Cache');

class Guild {
	constructor(guildId) {
		this.guildId = guildId;
	}

	async Create() {
		return new Promise(async (resolve, reject) => {
			const preExistingGuild = await Prisma.guild.findMany({
				where: {
					guildId: this.guildId
				}
			});

			if (preExistingGuild[0] == null) {
				return await Prisma.guild.create({
					data: {
						guildId: this.guildId,
					},
				});
			};
		});
	}

	async Onboarding() {
		return new Promise(async (resolve, reject) => {
			const cache = new Cache(this.guildId);
			const isBlacklisted = await cache.Blacklisted;
			if (isBlacklisted === undefined) {
				const getGuild = await Prisma.guild.findMany({
					where: {
						guildId: this.guildId
					}
				});
		
				if (getGuild[0] == undefined) {
					await this.Create();
					return resolve(true);
				}

				const isBlacklisted = getGuild[0].isBlacklisted;
	
				cache.Blacklisted = isBlacklisted;
				return resolve(!isBlacklisted);
			}
			resolve(!isBlacklisted);
		});
	}

	async ModuleEnabled(moduleId) {
		return new Promise(async (resolve, reject) => {
			const cache = new Cache(this.guildId);
			const modules = await cache.Modules;
			if (modules === undefined) {
				const modules = await Prisma.guildModules.findUnique({
					where: {
						guildId: this.guildId
					}
				});
				if (modules === null) return resolve(true);

				delete modules.guildId;
				cache.Modules = modules;

				return resolve(modules[`${moduleId.toLowerCase()}Enabled`] ?? true);
			}
			resolve(modules[`${moduleId.toLowerCase()}Enabled`] ?? true);
		});
	}

	get GuildJoinPreferences() {
		return new Promise(async (resolve, reject) => {
			const getPreferences = await Prisma.guildMemberAdd.findMany({
				where: {
					guildId: this.guildId
				},
				include: {
					welcomeMessages: true,
					welcomeDMs: true,
					roleAssignments: true,
					safetyScreening: true,
				}
			});

			let preferences = {};

			if (getPreferences[0] != null) {
				if (getPreferences[0].welcomeMessages[0] != null) {
					for (let welcomeMessage of getPreferences[0].welcomeMessages) {
						if (welcomeMessage.enabled) {
							preferences.welcomeMessageEnabled = true;
							break;
						}
					}
				}
	
				if (getPreferences[0].welcomeDMs != null) {
					if (!preferences.welcomeMessageEnabled) {
						if (getPreferences[0].welcomeDMs.enabled) {
							preferences.welcomeMessageEnabled = true;
						}
					}
				}
	
				if (getPreferences[0].roleAssignments[0] != null) {
					for (let roleAssignment of getPreferences[0].roleAssignments) {
						if (roleAssignment.enabled) {
							preferences.roleAssignEnabled = true;
							break;
						}
					}
				}
	
				if (getPreferences[0].safetyScreening != null) {
					if (getPreferences[0].safetyScreening.enabled) preferences.userSafetyScreeningEnabled = true;
				}
			}

			resolve(preferences);
		});
	}

	get WelcomeMessagePreferences() {
		return new Promise(async (resolve, reject) => {
			const getPreferences = await Prisma.guildMemberAdd.findMany({
				where: {
					guildId: this.guildId
				},
				include: {
					welcomeMessages: true,
					welcomeDMs: true,
				}
			});

			let welcomeMessageArray = [];
			if (getPreferences[0]?.welcomeMessages[0] !== undefined) {
				if (welcomeMessage.enabled) welcomeMessageArray.push({ message: welcomeMessage.message, channelId: welcomeMessage.channelId, type: 'guildMessage'});
			}
			if (getPreferences[0]?.welcomeDMs !== undefined) {
				if (getPreferences[0].welcomeDMs.enabled) welcomeMessageArray.push({ message: getPreferences[0].welcomeDMs.message, type: 'dm' });
			}
			resolve(welcomeMessageArray);
		});
	}

	get RoleAssignPreferences() {
		return new Promise(async (resolve, reject) => {
			const getPreferences = await Prisma.guildMemberAdd.findMany({
				where: {
					guildId: this.guildId
				},
				include: {
					roleAssignments: true,
				}
			});

			if (getPreferences[0] == undefined) return resolve(null);
			let roleAssignmentsArray = [];
			getPreferences[0].roleAssignments.forEach(roleAssignment => {
				if (roleAssignment.enabled) roleAssignmentsArray.push({ roleId: roleAssignment.roleId, delay: roleAssignment.delay });
			});
			resolve(roleAssignmentsArray);
		});
	}

	get ReactionRolePreferences() {
		return new Promise(async (resolve, reject) => {
			const getPreferences = await Prisma.messageReactionEvent.findMany({
				where: {
					guildId: this.guildId
				},
				include: {
					reactionRoles: true,
				}
			});

			if (getPreferences[0] == undefined) return resolve(null);
			let reactionRoleArray = [];
			getPreferences[0].reactionRoles.forEach(reactionRole => {
				if (reactionRole.enabled) reactionRoleArray.push({ messageId: reactionRole.messageId, emojiId: reactionRole.emojiId, roleId: reactionRole.roleId });
			});
			resolve(reactionRoleArray);
		});
	}

	async HasReactionRoleIntent(messageId, emojiId) {
		//FIXME: MAKE THIS LESS MESSY
		return new Promise(async (resolve, reject) => {
			let reactionRoleIntent = false;
			const getPreferences = await Prisma.messageReactionEvent.findMany({
				where: {
					guildId: this.guildId
				},
				select: {
					reactionRoles: {
						select: {
							messageId: true,
							emojiId: true,
						}
					},
				}
			});

			if (getPreferences[0] == undefined) return resolve(false);
			for (let reactionRole of getPreferences[0].reactionRoles) {
				if (reactionRole.messageId === messageId && reactionRole.emojiId === emojiId) {
					reactionRoleIntent = true;
					break;
				}
			}
			resolve(reactionRoleIntent);
		});
	}

	get JoinableRankPreferences() {
		return new Promise(async (resolve, reject) => {
			const getPreferences = await Prisma.joinableRankGuildPreferences.findMany({
				where: {
					guildId: this.guildId
				},
				include: {
					joinableRanks: true,
				}
			});

			if (getPreferences[0] == undefined) return resolve(null);
			let joinableRankArray = [];
			for (let joinableRank of getPreferences[0].joinableRanks) {
				if (joinableRank.enabled) joinableRankArray.push({ name: joinableRank.name, roleId: joinableRank.roleId, prerequisiteRoleId: joinableRank.prerequisiteRoleId, confirmationMessagesEphemeral: joinableRank.confirmationMessagesEphemeral });
			}
			resolve(joinableRankArray);
		});
	}

	get OnModLogPreferences() {
		return new Promise(async (resolve, reject) => {
			const getPreferences = await Prisma.onModLog.findUnique({
				where: {
					guildId: this.guildId
				}
			});

			if (getPreferences == undefined || !getPreferences.enabled) return resolve([]);
			resolve(getPreferences);
		});
	}

	async CreateJoinableRankInstance(name, roleId, prerequisiteRoleId, guildId, confirmationMessagesEphemeral) {
		return new Promise(async (resolve, reject) => {
			const setPreferences = await Prisma.joinableRankGuildPreferences.upsert({
				where: {
					guildId: guildId,
				},
				create: {
					guildId: guildId,
					joinableRanks: {
						create: {
							enabled: true,
							name,
							roleId,
							prerequisiteRoleId,
							confirmationMessagesEphemeral,
						}
					}
				},
				update: {
					joinableRanks: {
						create: {
							enabled: true,
							name,
							roleId,
							prerequisiteRoleId,
							confirmationMessagesEphemeral,
						}
					}
				},
			});

			resolve();
		});
	}

	async HideRank(name) {
		return new Promise(async (resolve, reject) => {
			const getPreferences = await Prisma.joinableRankGuildPreferences.findMany({
				where: {
					guildId: this.guildId,
				},
				select: {
					joinableRanks: {
						where: {
							name: name
						}
					}
				}
			});
			const setPreferences = await Prisma.joinableRankInstance.delete({
				where: {
					id: getPreferences[0].joinableRanks[0].id,
				}
			});

			resolve();
		});
	}

	get BannedPhrases() {
		return new Promise(async (resolve, reject) => {
			const cache = new Cache(this.guildId);
			const bannedPhrases = await cache.BannedPhrases;
			if (bannedPhrases === undefined) {
				const getPreferences = await Prisma.guildBannedPhrases.findMany({
					where: {
						guildId: this.guildId,
					},
					select: {
						bannedPhrases: {
							where: {
								enabled: true
							},
							select: {
								phrase: true,
								action: true,
								actionContext: true
							}
						}
					}
				});
				const bannedPhrases = getPreferences[0]?.bannedPhrases ?? [];
	
				cache.BannedPhrases = bannedPhrases;
				return resolve(bannedPhrases);
			}
			resolve(bannedPhrases);
		});
	}

	get AutoRoles() {
		return new Promise(async (resolve, reject) => {
			const getPreferences = await Prisma.guildMemberAdd.findMany({
				where: {
					guildId: this.guildId,
				},
				select: {
					roleAssignments: {
						where: {
							enabled: true
						},
						select: {
							roleId: true,
							delay: true,
						}
					}
				}
			});

			resolve(getPreferences[0]?.roleAssignments ?? []);
		});
	}

	async CreateAutoRole(roleId, delay) {
		return new Promise(async (resolve, reject) => {
			const setPreferences = await Prisma.guildMemberAdd.upsert({
				where: {
					guildId: this.guildId,
				},
				create: {
					guildId: this.guildId,
					roleAssignments: {
						create: {
							enabled: true,
							roleId,
							delay
						}
					}
				},
				update: {
					roleAssignments: {
						create: {
							enabled: true,
							roleId,
							delay
						}
					}
				},
			});
			resolve();
		});
	}

	async EditAutoRole(roleId, delay) {
		return new Promise(async (resolve, reject) => {
			const setPreferences = await Prisma.guildMemberAdd.update({
				where: {
					guildId: this.guildId,
				},
				data: {
					roleAssignments: {
						updateMany: {
							where: {
								roleId,
								enabled: true
							},
							data: {
								enabled: true,
								delay
							}
						}
					}
				},
			});
			resolve();
		});
	}

	async RemoveAutoRole(roleId) {
		return new Promise(async (resolve, reject) => {
			const setPreferences = await Prisma.guildMemberAdd.update({
				where: {
					guildId: this.guildId
				},
				data: {
					roleAssignments: {
						updateMany: {
							where: {
								roleId
							},
							data: {
								enabled: false,
							}
						}
					}
				},
			});
			resolve();
		});
	}

	get EventLogPreferences() {
		return new Promise(async (resolve, reject) => {
			const cache = new Cache(this.guildId);
			const eventLogPreferences = await cache.EventLogPreferences;
			if (eventLogPreferences === undefined) {
				const getPreferences = await Prisma.eventLogPreferences.findMany({
					where: {
						guildId: this.guildId,
					}
				});
				const eventLogPreferences = getPreferences[0] ?? [];
	
				cache.EventLogPreferences = eventLogPreferences;
				return resolve(eventLogPreferences);
			}
			resolve(eventLogPreferences);
		});
	}
}

module.exports = Guild