const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 60 * 60 * 6 });

class Cache {
	constructor(guildId) {
		this.guildId = guildId;
	}

	async Clear() {
		return new Promise(async (resolve, reject) => {
			cache.del(this.guildId + 'BannedPhrases');
			cache.del(this.guildId + 'Blacklisted');
			resolve();
		});
	}

	get BannedPhrases() {
		return new Promise(async (resolve, reject) => {
			const bannedPhrases = await cache.get(this.guildId + 'BannedPhrases');
			resolve(bannedPhrases);
		});
	}

	set BannedPhrases(bannedPhrases) {
		cache.set(this.guildId + 'BannedPhrases', bannedPhrases);
	}

	get Blacklisted() {
		return new Promise(async (resolve, reject) => {
			const isBlacklisted = await cache.get(this.guildId + 'Blacklisted');
			resolve(isBlacklisted);
		});
	}

	set Blacklisted(isBlacklisted) {
		cache.set(this.guildId + 'Blacklisted', isBlacklisted);
	}

	get EventLogPreferences() {
		return new Promise(async (resolve, reject) => {
			const eventLogPreferences = await cache.get(this.guildId + 'EventLogPreferences');
			resolve(eventLogPreferences);
		});
	}

	set EventLogPreferences(preferences) {
		cache.set(this.guildId + 'EventLogPreferences', preferences);
	}

	get Modules() {
		return new Promise(async (resolve, reject) => {
			const modules = await cache.get(this.guildId + 'Modules');
			resolve(modules);
		});
	}

	set Modules(modules) {
		cache.set(this.guildId + 'Modules', modules);
	}
}

module.exports = Cache;