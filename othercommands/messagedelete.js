const { RichEmbed } = require('discord.js');

module.exports = {
	name: 'messagedeleted',
	description: 'Can assign roles to people if they reply to a message with an emoji',
	guildOnly: false,
	args: false,
	cooldown: 0,
	aliases: [''],
	async execute(message, db) {
		const embed = new RichEmbed();
		embed.setTitle('Message deleted');
		embed.addField(message.author.tag, message.content || 'No text');
		embed.attachFiles(message.attachments.array());
		message.guild.channels.get(process.env.DISCORD_LOGS_ID).send('', embed);
	},
};