const { Client, Collection, RichEmbed, Emoji, MessageReaction } = require('discord.js');
const client = new Client();
const fs = require('fs');
const db = require('quick.db');

client.commands = new Collection();
client.othercommands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

const otherCommandFiles = fs.readdirSync('./othercommands').filter(file => file.endsWith('.js'));

for (const file of otherCommandFiles) {
	const command = require(`./othercommands/${file}`);
	client.othercommands.set(command.name, command);
}

const events = {
	MESSAGE_REACTION_ADD: 'messageReactionAdd',
	MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
};

// now using quickdb
/*
function saveFile(file) {
	fs.writeFile(file.fileName, JSON.stringify(file, null, 2), function(err) {
		if (err) return console.log(err);
		console.log(JSON.stringify(file, null, 2));
		console.log('writing to ' + file.fileName);
	});
}
*/

client.on('ready', () => {
	const date = new Date(client.readyTimestamp);
	console.log(date);
	console.log(`Logged in as ${client.user.tag}!`);
	if (db.get('restart.restarting')) {
		// console.log(client.channels);
		const restartchannel = client.channels.find(ch => ch.id === db.get('restart.channel'));
		db.set('restart.restarting', false);
		// console.log(restartchannel);
		restartchannel.fetchMessage(db.get('restart.message'))
			.then(msg => {
				// const date2 = new Date();
				// console.log(db.get('restart.timestamp'));
				const embed = new RichEmbed()
					.setTitle('✅ Rebooted, ' + (parseInt(date.getTime()) - parseInt(db.get('restart.timestamp'))) + 'ms');
				msg.edit('', embed);
			});
		// console.log(restartmessage);
	}
});


// start - messageReaction
client.on('raw', async event => {
	if (!Object.prototype.hasOwnProperty.call(events, event.t)) return;
	// console.log('raw event');

	const { d: data } = event;
	const user = client.users.get(data.user_id);
	const channel = client.channels.get(data.channel_id) || await user.createDM();

	// if (channel.messages.has(data.message_id)) return;

	const message = await channel.fetchMessage(data.message_id);
	const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
	let reaction = message.reactions.get(emojiKey);

	if (!reaction) {
		// Create an object that can be passed through the event like normal
		const emoji = new Emoji(client.guilds.get(data.guild_id), data.emoji);
		reaction = new MessageReaction(message, emoji, 1, data.user_id === client.user.id);
	}

	// console.log(events[event.t]);
	client.emit(events[event.t], reaction, user);

	/* new way using discordjs.guide
	if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) return;
	// Grab the channel to check the message from
	const channel = client.channels.get(packet.d.channel_id);
	if (!channel) return console.log('Channel not found');
	// There's no need to emit if the message is cached, because the event will fire anyway for that
	if (channel.messages.has(packet.d.message_id)) return;
	// Since we have confirmed the message is not cached, let's fetch it
	channel.fetchMessage(packet.d.message_id).then(message => {
		// Emojis can have identifiers of name:id format, so we have to account for that case as well
		const emoji = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;
		// This gives us the reaction we need to emit the event properly, in top of the message object
		const reaction = message.reactions.get(emoji);
		// Adds the currently reacting user to the reaction's users collection.
		if (reaction) reaction.users.set(packet.d.user_id, client.users.get(packet.d.user_id));
		// Check which type of event it is before emitting
		if (packet.t === 'MESSAGE_REACTION_ADD') {
			client.emit('messageReactionAdd', reaction, client.users.get(packet.d.user_id));
		}
		if (packet.t === 'MESSAGE_REACTION_REMOVE') {
			client.emit('messageReactionRemove', reaction, client.users.get(packet.d.user_id));
		}
	}); */
});
// end - MessageReaction

client.on('message', message => {
	// log all messages received, except if sent by the bot.
	if (!message.author.equals(client.user)) {
		// console.log(message.author.id + ' ' + message.author.username + ' @ ' + message.guild.id + ' ' + message.guild.name + ': ' + message.content);
	}
	else {
		// if author is bot return
		return;
    }
	// if new guild, no prefix set, set to !
	// now done by botjoinedguild.js
	// if (!db.get(`prefix.${message.guild.id}`)) db.set(`prefix.${message.guild.id}`, '!');
	// console.log(db.get(`prefix.${message.guild.id}`));
	// message is not a command?
    if (!message.content.startsWith(db.get(`prefix.${message.guild.id}`))) return;
    // find guildmember
	const clientguildmember = message.guild.members.find(guildMember => guildMember.id === client.user.id);
    // console.log(Clientguildmember);
    // slice removes prefix, trim removes spaces in front and behind, then split on space(s) using regex
    const args = message.content.slice(db.get(`prefix.${message.guild.id}`).length).trim().split(/ +/g);
    // get command from arguments
	const commandName = args.shift().toLowerCase();
	console.log('command \'' + commandName + '\' with args: ');
    console.log(args);

	// console.log(client.commands.get('help'));
	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) {
		message.channel.send('Command not found');
		return console.log('Command not found');
	}

	if (command.guildOnly && message.channel.type !== 'text') {
		return message.reply('I can\'t execute that command inside DMs!');
	}

	if (command.args && !args.length) {
		// return message.channel.send(`You didn't provide any arguments, ${message.author}!`);
		// new way includes proper usage.
		let reply = `You didn't provide any arguments, ${message.author}!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: **${db.get(`prefix.${message.guild.id}`)}${command.name} ${command.usage}**`;
		}

		return message.channel.send(reply);
	}

	try {
		command.execute(message, args, db);
	}
	catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
});

// Create an event listener for new guild members
client.on('guildMemberAdd', guildmember => {
	const command = client.othercommands.get('guildmemberadded');
	command.execute(guildmember, db);
	// Send the message to a designated channel on a server:
	/* outdated
	if (!db.get(`welcomechannel.${guildmember.guild.id}`)) db.set(`welcomechannel.${guildmember.guild.id}`, 'general');
	// console.log(db.get(`welcomechannel.${guildmember.guild.id}`));
	const channel = guildmember.guild.channels.find(ch => ch.name === db.get(`welcomechannel.${guildmember.guild.id}`)) || guildmember.guild.channels.find(ch => ch.id === db.get(`welcomechannel.${guildmember.guild.id}`));
	// console.log(channel);
	// Do nothing if the channel wasn't found on this server
	if (!channel) return;
	// Send the message, mentioning the member
	const standardwelcomemessage = `Welcome to the server, ${guildmember}`;
	// to do: COPY CODE FROM PREFIX
	channel.send(db.get(`welcomemessage.${guildmember.guild.id}`) || standardwelcomemessage);
	*/
});

client.on('messageReactionAdd', (messageReaction, user) => {
	const command = client.othercommands.get('messagereactionadded');
	// console.log(command);
	command.execute(messageReaction, user, db);
});

client.on('messageReactionRemove', (messageReaction, user) => {
	const command = client.othercommands.get('messagereactionremoved');
	// console.log(command);
	command.execute(messageReaction, user, db);
});

client.on('guildCreate', guild => {
	const command = client.othercommands.get('botjoinedguild');
	// console.log(command);
	command.execute(guild, db);
});

client.on('error', error => {
	console.error(new Date() + ': error');
	console.error(error.message);
});

client.login(process.env.AUTH_TOKEN);