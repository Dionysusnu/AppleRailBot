module.exports = {
	name: 'purge',
    description: 'Removes a number of messages in a channel',
    args: true,
    guildOnly: true,
	async execute(message, args) {
        // console.log(message.client)
        const authorguildmember = message.guild.members.find(member => member.id === message.author.id);
        if (!authorguildmember.hasPermission('MANAGE_MESSAGES')) return message.channel.send('You are not allowed to delete messages');
        const clientguildmember = message.guild.members.find(member => member.id === message.client.user.id);
        if (!clientguildmember.hasPermission('MANAGE_MESSAGES')) return message.channel.send('I don\'t have the manage messages permission!');
		if (!(((args[0] < 100) && (args[0] > 0)) || (args[0]) === 'all')) return message.channel.send('Please enter a valid number between 1 and 99');
        if (args[0] === 'all') {
            let messagesleft = true;
            let count = 0;
            while (messagesleft) {
                count += 1;
                console.log(count);
                message.channel.fetchMessages({ limit: 100 }).then(messages => {
                    message.channel.bulkDelete(messages, true);
                });
                const messages = await message.channel.fetchMessages({ limit: 100 });
                if (messages.size) {
                    messagesleft = true;
                }
                else {
                    messagesleft = false;
                    // console.log(messages);
                }
            }
        }
        else {
        const amountToDelete = parseInt(args[0]) + 1;
        message.channel.bulkDelete(amountToDelete, true);
        }
    },
};