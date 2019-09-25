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
			collector.once('collect', msg => {
				try {
					const regex = new RegExp('```js.+```', 's');
					const result = msg.content.match(regex);
					const string = 'const guild = arguments[0]; const author = arguments[1];' + result[0].slice(5, -3);
					message.channel.send(`\`\`\`${new Function(string)(message.guild, message.author)}\`\`\``);
				} catch (error) {
					message.channel.send(`\`\`\`${error}\`\`\``);
				}
			});
			message.channel.send('waiting');
		}
	},
};