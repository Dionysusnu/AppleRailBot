const { RichEmbed } = require('discord.js');

module.exports = {
	name: 'messagedeleted',
	description: 'Can assign roles to people if they reply to a message with an emoji',
	guildOnly: false,
	args: false,
	cooldown: 0,
	aliases: [''],
	async execute(message) {
		const logs = await message.guild.fetchAuditLogs({ type: 'MESSAGE_DELETE', limit: 10 });
		const filtered = logs.entries.filter(log => log.target === message.author && log.extra.channel === message.channel).first();
		const embed = new RichEmbed();
		embed.setAuthor(filtered && filtered.executor.tag || message.author.tag, filtered && filtered.executor.avatarURL || message.author.avatarURL);
		embed.setTitle('**Message deleted**');
		embed.addField('Author', `${message.author}`);
		embed.addField('Channel', `${message.channel}`);
		embed.addField('Message timestamp', message.createdTimestamp);
		message.content && embed.addField('Content', message.content);
		message.embeds.length && embed.addField('\u200B', 'Contained embed(s)');
		embed.attachFiles(message.attachments.array());
		embed.setTimestamp();
		message.client.channels.get(process.env.DISCORD_LOGS_ID).send('', embed);
	},
};