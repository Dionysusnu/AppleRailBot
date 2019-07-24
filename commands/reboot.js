const { RichEmbed } = require('discord.js');
const auth = require('../private/auth.json');

module.exports = {
	name: 'reboot',
	description: 'Bot owner only',
	execute(message, args, db) {
        // only if message sent by bot owner
		if(message.author.id === auth.ownerID) {
			const embed = new RichEmbed()
				.setTitle('Rebooting')
				.setImage('https://media1.tenor.com/images/498143fe99695d987094763d6ba207cc/tenor.gif?itemid=4770991');
			message.channel.send(embed)
				.then(restartmessage => {
					db.set('restart.message', restartmessage.id);
					db.set('restart.channel', restartmessage.channel.id);
					db.set('restart.restarting', true);
					db.set('restart.timestamp', new Date().getTime());
                    process.exit(0);
				});
		}
		else {
			message.channel.send('You fool, only the bot owner can do that');
		}
    },
};