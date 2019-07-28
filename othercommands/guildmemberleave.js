module.exports = {
	name: 'guildmemberleft',
	description: 'Sends the leave message when a user leaves',
	guildOnly: true,
	args: false,
	cooldown: 0,
	aliases: [''],
	execute(guildmember, db) {
		const str = db.get('leavemessage');
		const regex = new RegExp('&user', 'g');
		// console.log(regex);
		// console.log(str);
		const welcomemsg = str.replace(regex, `${guildmember.user.tag} (id ${guildmember.id})`);
		const welcomechannelid = db.get('welcomechannel');
		// console.log(welcomechannelid);
		const welcomechannel = guildmember.guild.channels.find(channel => channel.id === welcomechannelid);
		if (!welcomechannel) return;
		welcomechannel.send(welcomemsg);
	},
};