module.exports = {
	name: 'messagereactionremoved',
	description: 'Can remove roles from people if they remove an emoji from a message',
	guildOnly: false,
	args: false,
	cooldown: 0,
	aliases: [''],
	async execute(messageReaction, user, db) {
		console.log('messagereactionremoved');
	},
};