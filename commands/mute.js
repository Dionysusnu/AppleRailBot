const mutedroles = [423159415013769247];
module.exports = {
	name: 'mute',
	description: '',
	guildOnly: true,
	args: true,
	aliases: [],
	cannotDisable: true,
	async execute(message, args) {
		const user = message.guild.member(message.mentions.users.first());
		const oldroles = user.roles;
		user.setRoles(mutedroles);
		setTimeout(() => {
			user.setRoles(oldroles);
		}, args[1] * 1000 * 60);
	},
};