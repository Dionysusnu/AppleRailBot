const { Permissions } = require('discord.js');
const disabled = Permissions.FLAGS;
console.log(disabled);
module.exports = {
	name: 'rolehereping',
	description: 'pings a specific role with `@here`',
	guildOnly: true,
	args: true,
	cooldown: 5,
	cannotDisable: false,
	aliases: ['rolepinghere'],
	async execute(message, args) {
		if (!message.guild.roles.has(args[0])) {
			return message.channel.send('Invalid role');
		} else {
			const old = message.channel.permissionOverwrites;
			const promises = [];
			for (const [id] of message.guild.roles) {
				promises.push(message.channel.overwritePermissions(id, disabled, 'hereping'));
			}
			await Promise.all(promises);
			await message.channel.send('@here ^^');
			for (const [id, oldPerms] of old) {
				message.channel.overwritePermissions(id, oldPerms);
			}
		}
	},
};