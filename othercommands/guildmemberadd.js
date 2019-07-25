module.exports = {
	name: 'guildmemberadded',
	description: 'Sends the welcome message when a user joins',
	guildOnly: true,
	args: false,
	cooldown: 0,
	aliases: [''],
	execute(guildmember, db) {
		if(db.get(`welcomemessagedisabled.${guildmember.guild.id}`)) return console.log('Welcome message disabled');
		const str = db.get(`welcomemessage.${guildmember.guild.id}`);
		const regex = new RegExp('&user', 'g');
		// console.log(regex);
		// console.log(str);
		const welcomemsg = str.replace(regex, `${guildmember}`);
		const welcomechannelid = db.get(`welcomechannel.${guildmember.guild.id}`);
		// console.log(welcomechannelid);
		const welcomechannel = guildmember.guild.channels.find(channel => channel.id === welcomechannelid);
		if (!welcomechannel) return;
		welcomechannel.send(welcomemsg);
	},
};