const { RichEmbed } = require('discord.js');

module.exports = {
	name: 'embed',
	description: 'Embeds an example message',
	guildOnly: false,
	args: false,
	cooldown: 1,
	cannotDisable: false,
	aliases: [''],
	execute(message, args) {
        // We can create embeds using the MessageEmbed constructor
		// Read more about all that you can do with the constructor
		// over at https://discord.js.org/#/docs/main/stable/class/RichEmbed
		const embed = new RichEmbed()
		// Set the title of the field
			.setTitle('A slick little embed')
		// Set the color of the embed
			.setColor(0xFF0000)
		// Set the main content of the embed
			.setDescription('Hello, this is a slick embed!');
		// Send the embed to the same channel as the message
        message.channel.send(embed);
    },
};