import { RichEmbed } from 'discord.js';

export const name = 'messagedeleted';
export const description = 'Can assign roles to people if they reply to a message with an emoji';
export const guildOnly = false;
export const args = false;
export const cooldown = 0;
export const aliases = [''];
export async function execute(message) {
	const logs = await message.guild.fetchAuditLogs({ type: 'MESSAGE_DELETE' });
	const filtered = logs.entries.filter(log => log.target === message).first();
	const embed = new RichEmbed();
	embed.setTitle((filtered && filtered.avatarURL || message.author.avatarURL) + (filtered && filtered.tag || message.author.tag));
	embed.setDescription('**Message deleted**');
	embed.addField('Author', `${message.author}`);
	embed.addField('Channel', `${message.channel}`);
	message.content && embed.addField('Content', message.content);
	embed.attachFiles(message.attachments.array());
	message.guild.channels.get(process.env.DISCORD_LOGS_ID).send('', embed);
}