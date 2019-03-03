const { createReplyWrapper } = require('../../util/msg-utils')
const db = require('../../util/db')

module.exports = {
  admin: true,
  exec: async (msg, bot) => {
    const reply = createReplyWrapper(msg, false)
    let member
    if (!msg.mentions.length) {
      const args = msg.content.trim().split(' ').slice(1)
      if (!args.length) {
        return reply('please mention a user or include a discord ID!')
      }

      const id = args[0].trim()
      member = msg.channel.guild.members.find(m => m.id === id)
      if (!member) {
        return reply(`I could not find a member with the ID \`${id}\`.`)
      }
    } else {
      member = msg.mentions[0]
    }

    const pin = await db.hget(`user:${member.id}`, 'pin')
    if (!pin) {
      return reply('the member does not have a registered PIN.')
    }

    return reply(`**${member.username}** has the PIN \`${pin}\`.`)
  }
}