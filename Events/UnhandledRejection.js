module.exports = {
	name: 'unhandledRejection',
	once: false,
	async execute(error) {
		console.log('Unhandled Rejection: ' + error);
	},
};
