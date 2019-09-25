const { MessageCollector } = require('discord.js');

module.exports = {
	name: 'eval',
	description: 'bot owner only',
	guildOnly: false,
	args: false,
	cooldown: 5,
	cannotDisable: true,
	aliases: [],
	async execute(message) {
		if (message.author.id === process.env.OWNER_ID) {
			const collector = new MessageCollector(message.channel, msg => msg.author.id === message.author.id, {
				maxMatches: 1,
			});
			collector.on('collect', msg => {
				const regex = new RegExp('```js.+```', 's');
				message.reply(regex);
				message.reply(`evaling ${msg.match(regex)[0]}`);
			});
		}
	},
};