module.exports = {
	name: 'shardError',
	once: false,
	async execute(error) {
		console.log('Shard Error: ' + error);
	},
};
