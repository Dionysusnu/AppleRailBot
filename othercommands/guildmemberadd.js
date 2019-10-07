module.exports = {
	name: 'guildmemberadded',
	description: 'Sends the welcome message when a user joins',
	guildOnly: true,
	args: false,
	cooldown: 0,
	aliases: [''],
	async execute(guildmember, db) {
		const str = db.get('welcomemessage');
		const regex = new RegExp('&user', 'g');
		// console.log(regex);
		// console.log(str);
		const welcomemsg = str.replace(regex, `${guildmember}`);
		const welcomechannelid = db.get('welcomechannel');
		// console.log(welcomechannelid);
		const welcomechannel = guildmember.guild.channels.find(channel => channel.id === welcomechannelid);
		if (!welcomechannel) return;
		welcomechannel.send(welcomemsg);
	},
};