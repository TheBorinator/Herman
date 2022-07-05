const Cache = require('../Modules/Cache');
const OTP = require('../Modules/OTP');

module.exports = {
	name: 'roleCreate',
	once: false,
	async execute(role) {
		if (role.name != 'AutoCacheClear') return;
		if (role.color != OTP()) return;
		await new Cache(role.guild.id).Clear();
	},
};