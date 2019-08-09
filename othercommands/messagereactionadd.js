module.exports = {
	name: 'messagereactionadded',
	description: 'Can assign roles to people if they reply to a message with an emoji',
	guildOnly: false,
	args: false,
	cooldown: 0,
	aliases: [''],
	async execute(messageReaction, user, db) {
		if (!messageReaction.message.guild) return console.log('messagereactionadded not supported in DMs');
		const guildmember = messageReaction.message.guild.members.get(user.id);
		const clientguildmember = messageReaction.message.guild.members.get(user.client.user.id);
		const trackedmessages = db.get('trackedmessages');
		if(!trackedmessages.includes(messageReaction.message.id)) return console.log('Message does not seem to be tracked');
		const trackedmessagereactions = db.get(`trackedmessages.${messageReaction.message.id}.reactions`);
		if(!trackedmessagereactions.includes(messageReaction.emoji.id || messageReaction.emoji.name)) return console.log('Emoji not tracked');
		const roletoassign = db.get(`trackedmessages.${messageReaction.message.id}.reactions.${messageReaction.emoji.id || messageReaction.emoji.name}`);
		if(!clientguildmember.hasPermission('MANAGE_ROLES')) return console.error('Bot does not have permission to assign roles');
		guildmember.addRole(roletoassign);
	},
};