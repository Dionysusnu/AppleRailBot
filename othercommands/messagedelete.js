const { RichEmbed } = require('discord.js');

module.exports = {
	name: 'messagedeleted',
	description: 'Can assign roles to people if they reply to a message with an emoji',
	guildOnly: false,
	args: false,
	cooldown: 0,
	aliases: [''],
	async execute(message) {
		const logs = await message.guild.fetchAuditLogs({ type: 'MESSAGE_DELETE' });
		const filtered = logs.entries.filter(log => log.target === message).first();
		const embed = new RichEmbed();
		embed.setImage(message.author.avatarURL);
		embed.setTitle(filtered && filtered.tag || message.author.tag);
		embed.setDescription('**Message deleted**');
		embed.addField('Author', `${message.author}`);
		embed.addField('Channel', `${message.channel}`);
		message.content && embed.addField('Content', message.content);
		embed.attachFiles(message.attachments.array());
		message.guild.channels.get(process.env.DISCORD_LOGS_ID).send('', embed);
	},
};