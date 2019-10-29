/* eslint-disable require-atomic-updates */
const { Client, Collection, RichEmbed, Emoji, MessageReaction } = require('discord.js');
const client = new Client();
const fs = require('fs');
// const db = require('quick.db');

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

// now using quickdb, but actually a db message for easier hosting
/*
function saveFile(file) {
	fs.writeFile(file.fileName, JSON.stringify(file, null, 2), function(err) {
		if (err) return console.log(err);
		console.log(JSON.stringify(file, null, 2));
		console.log('writing to ' + file.fileName);
	});
}
*/

let dbchannel, dbmessage, editpromise;

client.on('ready', async () => {
	const date = new Date(client.readyTimestamp);
	console.log(date);
	console.log(`Logged in as ${client.user.tag}!`);
	dbchannel = client.channels.get(process.env.DATABASE_CHANNEL);
	dbmessage = dbchannel && await dbchannel.fetchMessage(process.env.DATABASE_MESSAGE);
	if (!dbmessage) {
		console.error('Couldn\'t fetch database');
		process.exit(1);
	}
});

const db = {
	set: async function(dbkey, value) {
		if (editpromise) {
			await editpromise;
		}
		let foundfield = false;
		for (const field of dbmessage.embeds[0].fields) {
			if (field.name === dbkey) {
				field.value = value;
				foundfield = true;
				break;
			}
		}
		const embed = new RichEmbed(dbmessage.embeds[0]);
		if (!foundfield) {
			embed.addField(dbkey, value);
		}
		editpromise = dbmessage.edit('', embed);
		await editpromise;
		editpromise = null;
	},
	get: function(dbkey) {
		if (!dbmessage) {
			return null;
		}
		// console.log(dbmessage.embeds[0]);
		for (const field of dbmessage.embeds[0].fields) {
			// console.log('comparing ' + field.name + ' to ' + dbkey);
			if (field.name === dbkey) {
				return field.value;
			}
		}

	},
	delete: async function(dbkey) {
		if (editpromise) {
			await editpromise;
		}
		const embed = new RichEmbed(dbmessage.embeds[0]);
		embed.fields = embed.fields.filter(field => field.name !== dbkey);
		editpromise = dbmessage.edit('', embed);
		await editpromise;
		editpromise = null;
	},
};


// start - messageReaction
client.on('raw', async event => {
	if (!Object.prototype.hasOwnProperty.call(events, event.t)) {
		return;
	}
	// console.log('raw event');

	const { d: data } = event;
	const user = client.users.get(data.user_id);
	const channel = client.channels.get(data.channel_id) || await user.createDM();

	// if (channel.messages.has(data.message_id)) return;

	const message = await channel.fetchMessage(data.message_id);
	const emojiKey = data.emoji.id ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
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
	if (message.author.equals(client.user) || !message.guild) {
		return;
	}
	// if new guild, no prefix set, set to !
	// now done by botjoinedguild.js
	// if (!db.get(`prefix.${message.guild.id}`)) db.set(`prefix.${message.guild.id}`, '!');
	// console.log(db.get(`prefix.${message.guild.id}`));
	// message is not a command?
	// find guildmember
	const clientguildmember = message.guild.members.find(guildMember => guildMember.id === client.user.id);
	const prefix = db.get('prefix');
	if (!(message.content.startsWith(prefix) || message.mentions.members.first() === clientguildmember)) {
		return;
	}
	// console.log(Clientguildmember);
	// slice removes prefix, trim removes spaces in front and behind, then split on space(s) using regex
	const args = message.content.slice(prefix.length).trim().split(/ +/g);
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

	if (command.args && !args.length) {
		// return message.channel.send(`You didn't provide any arguments, ${message.author}!`);
		// new way includes proper usage.
		let reply = `You didn't provide any arguments, ${message.author}!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: **${db.get('prefix')}${command.name} ${command.usage}**`;
		}

		return message.channel.send(reply);
	}
	command.execute(message, args, db).catch(error => {
		console.error(error);
		if (message.author.id === process.env.OWNER_ID) {
			message.channel.send('Error:```js ' + error + ' ```');
		} else {
			message.reply('there was an error trying to execute that command!');
		}
	});
});

client.on('guildMemberRemove', guildmember => {
	const command = client.othercommands.get('guildmemberleft');
	command.execute(guildmember, db).catch(console.error);
});

client.on('guildMemberAdd', guildmember => {
	const command = client.othercommands.get('guildmemberadded');
	command.execute(guildmember, db).catch(console.error);
});

client.on('messageReactionAdd', (messageReaction, user) => {
	const command = client.othercommands.get('messagereactionadded');
	// console.log(command);
	command.execute(messageReaction, user, db).catch(console.error);
});

client.on('messageReactionRemove', (messageReaction, user) => {
	const command = client.othercommands.get('messagereactionremoved');
	// console.log(command);
	command.execute(messageReaction, user, db).catch(console.error);
});

client.on('messageDelete', message => {
	const command = client.othercommands.get('messagedeleted');
	// console.log(command);
	command.execute(message, db).catch(console.error);
});

client.on('error', error => {
	console.error(new Date() + ': error');
	console.error(error.message);
});

client.login(process.env.AUTH_TOKEN);