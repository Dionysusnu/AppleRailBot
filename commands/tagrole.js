const roles = new Map([
	['td', 500318304070795275],
	['qd', 500318174076600321],
	['pss', 466942558325571606],
	['lts', 419817477170790400],
	['dev', 599283987348979712],
	['shift', 599283872810663956],
]);
module.exports = {
	name: 'tagrole',
	description: '',
	guildOnly: true,
	args: true,
	cooldown: 5,
	cannotDisable: false,
	async execute(message, args) {
		if (message.member.hasPermission('MENTION_EVERYONE')) {
			const role = message.guild.roles.get(roles.get(args[0].toLowerCase()));
			const mentionable = role.mentionable;
			await message.delete();
			mentionable || await role.setMentionable(true, 'tag');
			await message.channel.send(`^^ ${role}`);
			await role.setMentionable(mentionable, 'after tag');
		}
	},
};