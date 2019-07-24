module.exports = {
	name: 'help',
	description: 'Provides info about commands.',
	guildOnly: false,
	args: false,
	cooldown: 1,
	cannotDisable: true,
	aliases: ['h'],
	execute(message, args, db) {
		return message.reply('This command is not finished yet.');
	},
};