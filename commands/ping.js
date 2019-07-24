module.exports = {
	name: 'ping',
    description: 'Replies with a simple message.\nYou can use it to check if the bot is working.',
    guildOnly: false,
    args: false,
    cooldown: 5,
    cannotDisable: false,
	execute(message) {
        const date = new Date();
        message.channel.send('Pong!')
            .then(msg => {
                msg.edit('Pong! ' + (parseInt(msg.createdTimestamp) - parseInt(message.createdTimestamp)) + 'ms');
            });
        // or message.reply('pong') to add mention to message author
    },
};