const { RichEmbed } = require('discord.js');

module.exports = {
	name: 'help',
	description: 'Provides info about commands.',
	guildOnly: false,
	args: false,
	cooldown: 1,
	cannotDisable: true,
	aliases: ['h'],
	execute(message, args, db) {
		const embed = new RichEmbed();
		const commands = message.client.commands;
		for (const [key, command] of commands) {
			embed.addField(key, command);
		}
		return message.channel.send('', embed);
	},
};