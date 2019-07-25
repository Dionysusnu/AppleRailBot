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
		if (!(parseInt(args[0]) || (args[0]) === 'all')) return message.channel.send('Please enter a valid number between 1 and 99');
		if (args[0] === 'all') {
			let messagesleft = true;
			let messages = await message.channel.fetchMessages({ limit: 100 });
			while (messagesleft) {
				await message.channel.bulkDelete(messages, true);
				messages = await message.channel.fetchMessages({ limit: 100 });
				if (messages.size) {
					messagesleft = true;
				} else {
					messagesleft = false;
					// console.log(messages);
				}
			}
		} else {
			let amountToDelete = parseInt(args[0]) + 1;
			while (amountToDelete) {
				if (amountToDelete >= 100) {
					message.channel.bulkDelete(100, true);
					amountToDelete -= 100;
				} else {
					message.channel.bulkDelete(amountToDelete, true);
					amountToDelete = 0;
				}
			}
		}
	},
};