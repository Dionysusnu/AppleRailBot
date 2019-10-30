const { MessageCollector } = require('discord.js');

module.exports = {
	name: 'spamtag',
	description: '',
	guildOnly: true,
	args: true,
	cooldown: 5,
	cannotDisable: false,
	aliases: ['tagspam'],
	async execute(message) {
		if (message.author.id === process.env.OWNER_ID) {
			const messages = [];
			const interval = setInterval(async () => {
				messages.push(await message.channel.send(`${message.mentions.users.first()}`));
			}, 1000);
			const collector = new MessageCollector(message.channel, msg => msg.author.id === message.author.id, {
				maxMatches: 1,
			});
			collector.once('collect', () => {
				clearInterval(interval);
				message.channel.bulkDelete(messages);
			});
		}
	},
};