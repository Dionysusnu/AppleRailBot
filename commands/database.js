module.exports = {
	name: 'database',
	description: 'bot owner only',
	guildOnly: true,
	args: true,
	cooldown: 5,
	cannotDisable: true,
	aliases: ['db'],
	execute(message, args, db) {
		if (message.author.id != process.env.OWNER_ID) {
			return;
		}
		switch (args[0]) {
		case 'set': {
			db.set(args[1], args[2]);
			message.reply('done!');
			break;
		}
		case 'get': {
			message.reply(db.get(args[1]));
			break;
		}
		case 'delete': {
			db.delete(args[1]);
			message.reply('done!');
			break;
		}
		}
	},
};