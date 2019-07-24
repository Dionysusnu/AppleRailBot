module.exports = {
	name: 'listemojis',
	description: 'Lists all the custom emojis in this server.',
	guildOnly: true,
	args: false,
	cooldown: 1,
	cannotDisable: false,
	aliases: ['lemojis', 'listem'],
	execute(message, args) {
        const emojiList = message.guild.emojis.map(e=>e.toString()).join(' ');
		if (!emojiList) {
			message.channel.send('This server has no custom emojis.');
		}
        else {
			message.channel.send(emojiList);
		}
    },
};