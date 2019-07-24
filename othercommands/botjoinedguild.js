module.exports = {
	name: 'botjoinedguild',
	description: 'Sets some values like welcomemessage',
	guildOnly: true,
	args: false,
	cooldown: 0,
	aliases: [''],
	execute(guild, db) {
        db.set(`welcomemessage.${guild.id}`, 'Welcome, &user!');
        db.set(`disabledcommands.${guild.id}`, []);
        let welcomechannel = guild.channels.find(ch => ch.name === 'general');
        if (!welcomechannel) {
            welcomechannel = guild.channels.find(ch => ch.name === 'welcome');
        }
        if (!welcomechannel) {
            welcomechannel = guild.channels.first();
        }
        db.set(`welcomechannel.${guild.id}`, welcomechannel.id);
        db.set(`prefix.${guild.id}`, '!');
    },
};