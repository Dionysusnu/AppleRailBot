module.exports = {
	name: 'disabledcommands',
	description: '',
	guildOnly: true,
	args: false,
	aliases: ['disabledcmds'],
	cannotDisable: true,
	execute(message, args, db) {
		const disabledcommands = db.get(`disabledcommands.${message.guild.id}`);
		if (disabledcommands.length == 0) return message.channel.send('There are no disabled commands on this server.');
		const messagetosend = 'these commands are currently disabled on this server:\n**' + disabledcommands.join(', ') + '**';
		message.channel.send(messagetosend);
    },
};