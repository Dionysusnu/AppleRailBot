module.exports = {
	name: 'config',
	description: 'Set the server options.',
	usage: '<prefix|disabledcommands|welcomemessage|welcomechannel>',
	args: true,
	guildOnly: true,
	cannotDisable: true,
	async execute(message, args, db) {
		args[0] = args[0].toLowerCase();
		// if only one arg, display current setting and usage
		if (args.length === 1) {
			const prefix = db.get('prefix');
			switch (args[0]) {
			case 'prefix': {
				return message.channel.send(`Usage: **${prefix}config prefix <new prefix>**\nThe current prefix is **${prefix}**`);
			}
			case 'disabledcommands': {
				return message.channel.send(`Usage: **${prefix}config disabledcommands <enable|disable> <fullcommandname(no aliases)>**\nTo get a list of all disabled commands, use **${prefix}disabledcommands**`);
			}
			case 'welcomemessage': {
				return message.channel.send(`Usage: **${prefix}config welcomemessage set**, this will give you more instructions.\nThe current welcome message is:\n${db.get('welcomemessage')}`);
			}
			case 'leavemessage': {
				return message.channel.send(`Usage: **${prefix}config leavemessage set**, this will give you more instructions.\nThe current leave message is:\n${db.get('leavemessage')}`);
			}
			case 'welcomechannel': {
				return message.channel.send(`Usage: **${prefix}config welcomechannel <id>**\nThe current welcome channel is:\n${db.get('welcomechannel')}`);
			}
			default: {
				return message.channel.send('That\'s not a valid setting');
			}
			}
		}
		switch (args[0]) {
		case 'prefix': {
			const prefix = args[1];
			console.log('Prefix set to: ' + args[1]);
			db.set('prefix', prefix);
			message.channel.send('Prefix set to: ' + args[1]);
			break;
		}
		case 'disabledcommands': {
			const disabledcommands = db.get('disabledcommands');
			const prefix = db.get('prefix');
			switch(args[1]) {
			case 'enable': {
				if (!args[2]) return message.channel.send(`Usage: **${prefix}config disabledcommands enable <fullcommandname(no aliases)>**\nTo get a list of all disabled commands, use **${prefix}disabledcommands**`);
				if (!disabledcommands) return message.channel.send('There are no disabled commands on this server, so you can\'t enable any');
				const pos = disabledcommands.indexOf(args[2]);
				if (!pos) return message.channel.send('Either that command is already enabled, or you didn\'t enter a valid command (aliases are not supported)');
				disabledcommands.splice(pos, 1);
				db.set('disabledcommands', disabledcommands);
				message.channel.send('Command enabled');
				break;
			}
			case 'disable': {
				// message.channel.send('WIP');
				if (!args[2]) return message.channel.send(`Usage: **${prefix}config disabledcommands disable <fullcommandname(no aliases)>**\nTo get a list of all disabled commands, use **${prefix}disabledcommands**`);
				const commands = message.client.commands;
				// console.log(commands);
				// console.log(args[2]);
				if (disabledcommands.includes(args[2])) return message.channel.send('This command is already disabled');
				if (!commands.has(args[2])) return message.channel.send('That\'s not a valid command');
				const command = commands.get(args[2]);
				if (command.cannotDisable) return message.channel.send('This command can\'t be disabled');
				disabledcommands.push(args[2]);
				db.set('disabledcommands', disabledcommands);
				message.channel.send('Disabled command');
				break;
			}
			}
			break;
		}
		case 'welcomemessage': {
			const regex = new RegExp('&user', 'g');
			switch (args[1].toLowerCase()) {
			case 'id': {
				// let welcomemessagechannel = message.guild.channels.find(ch => ch.id === args[3]);
				// if (!welcomemessagechannel) welcomemessagechannel = message.mentions.channels.first();
				// let messagefetched;
				const prefix = db.get('prefix');
				if (!args[2]) return message.channel.send(`Usage: **${prefix}config welcomemessage id <id of the message>**`);
				const channels = message.guild.channels;
				channels.forEach(async (id, channel) => {
					const fetched = channel.type === 'text' && await channel.fetchMessage(args[2]);
					if (fetched) {
						db.set('welcomemessage', fetched.content);
						const welcomemessageformatted = fetched.content.replace(regex, `${message.author}`);
						return message.channel.send('Welcome message set succesfully, here\'s an example:\n' + welcomemessageformatted);
					}
				});
				// console.log('For loop ended');
				break;
			}
			case 'set': {
				const filter = m => m.author === message.author;
				// filters only messages from author
				const collector = message.channel.createMessageCollector(filter, { time: 300000 });
				// time in ms
				console.log('created messageCollector');
				let timedout = true;
				const prefix = db.get('prefix');
				message.channel.send(`Please send the welcome message now.\nYou can use **&user** in any place where you'd like to include a mention to the user that joined.\nAfter posting the message, you will see a preview of your welcome message, and a prompt if you like it or not.\nAfter 5 minutes the configuration will be canceled. If your message is too long, you can use **${prefix}config welcomemessage id <id of the message> <channel where the message was posted|ID of that channel>** to enter an ID instead of typing the message.`);
				collector.on('collect', msg => {
					// console.log(`Collected ${m.content}`);
					const str = msg.content;
					// const regex = /$user/g;
					// console.log(regex);
					// console.log(str);
					const welcomemsg = str.replace(regex, `${message.author}`);
					message.channel.send('Example welcome message:\n' + welcomemsg + '\nPlease say **yes** if this is correct. If not, say **no** and run the config command again.');
					const collector2 = message.channel.createMessageCollector(filter, { time: 10000 });
					collector2.on('collect', msg2 => {
						if (msg2.content.toLowerCase() === 'yes') {
							db.set('welcomemessage', str);
							message.channel.send('Welcome message set succesfully');
						} else {
							message.channel.send('Configuration cancelled');
						}
						collector2.stop();
					});
					collector2.on('end', collected2 => console.log(`Collected ${collected2.size} items`));
					timedout = false;
					collector.stop();
				});
				collector.on('end', () => {
					if (timedout) message.channel.send('Time expired.');
				});
				break;
			}
			}
			break;
		}
		case 'leavemessage': {
			const regex = new RegExp('&user', 'g');
			switch (args[1].toLowerCase()) {
			case 'id': {
				// let welcomemessagechannel = message.guild.channels.find(ch => ch.id === args[3]);
				// if (!welcomemessagechannel) welcomemessagechannel = message.mentions.channels.first();
				// let messagefetched;
				const prefix = db.get('prefix');
				if (!args[2]) return message.channel.send(`Usage: **${prefix}config leavemessage id <id of the message>**`);
				const channels = message.guild.channels;
				channels.forEach(async (id, channel) => {
					const fetched = channel.type === 'text' && await channel.fetchMessage(args[2]);
					if (fetched) {
						db.set('welcomemessage', fetched.content);
						const welcomemessageformatted = fetched.content.replace(regex, `${message.author}`);
						return message.channel.send('Welcome message set succesfully, here\'s an example:\n' + welcomemessageformatted);
					}
				});
				// console.log('For loop ended');
				break;
			}
			case 'set': {
				const filter = m => m.author === message.author;
				// filters only messages from author
				const collector = message.channel.createMessageCollector(filter, { time: 300000 });
				// time in ms
				console.log('created messageCollector');
				let timedout = true;
				const prefix = db.get('prefix');
				message.channel.send(`Please send the leave message now.\nYou can use **&user** in any place where you'd like to include a mention to the user that left.\nAfter posting the message, you will see a preview of your leave message, and a prompt if you like it or not.\nAfter 5 minutes the configuration will be canceled. If your message is too long, you can use **${prefix}config leavemessage id <id of the message> <channel where the message was posted|ID of that channel>** to enter an ID instead of typing the message.`);
				collector.on('collect', msg => {
					// console.log(`Collected ${m.content}`);
					const str = msg.content;
					// const regex = /$user/g;
					// console.log(regex);
					// console.log(str);
					const welcomemsg = str.replace(regex, `${message.author}`);
					message.channel.send('Example leave message:\n' + welcomemsg + '\nPlease say **yes** if this is correct. If not, say **no** and run the config command again.');
					const collector2 = message.channel.createMessageCollector(filter, { time: 10000 });
					collector2.on('collect', msg2 => {
						if (msg2.content.toLowerCase() === 'yes') {
							db.set('leavemessage', str);
							message.channel.send('Leave message set succesfully');
						} else {
							message.channel.send('Configuration cancelled');
						}
						collector2.stop();
					});
					collector2.on('end', collected2 => console.log(`Collected ${collected2.size} items`));
					timedout = false;
					collector.stop();
				});
				collector.on('end', () => {
					if (timedout) message.channel.send('Time expired.');
				});
				break;
			}
			}
			break;
		}
		case 'welcomechannel': {
			let welcomechannel = message.mentions.channels.first();
			if (!welcomechannel) {
				welcomechannel = message.guild.channels.get(args[1]);
			}
			if (!welcomechannel) {
				welcomechannel = message.guild.channels.find(ch => ch.name === args[1]);
			}
			if (!welcomechannel) return message.channel.send('That channel was not found, try using the channel ID');
			db.set('welcomechannel', welcomechannel.id);
			message.channel.send(`Welcome channel set to ${welcomechannel}`);
			break;
		}
		default: {
			message.channel.send('That\'s not a valid setting');
			break;
		}
		}
	},
};