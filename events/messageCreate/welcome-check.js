const db = require('../../util/db')
const { createReplyWrapper, deleteDelay } = require('../../util/msg-utils')

const isValidPIN = str => {
  // TODO: Check if PIN is valid
  if (str === 'TESTING!!') return true
  return false
}

const isPassword = str => {
  // TODO: Check if password is correct
  if (str === 'PASSWORD!!') return true
  return false
}

module.exports = async (msg, bot) => {
  if (msg.author.id === bot.user.id) return
  if (msg.author.bot) return
  if (msg.channel.type === 1) return

  // Check if message is sent to welcome channel
  if (msg.channel.id === process.env.WELCOME_CHANNEL_ID) {
    const reply = createReplyWrapper(msg)

    const str = msg.content.replace(' ', '')

    try {
      const auth = await db.hget(msg.author.id, 'auth')
      if (!auth) {
        if (!isValidPIN(str)) {
          return reply('the PIN is invalid. Please use a valid PIN.')
        }
        await db.hmset(msg.author.id, 'pin', str, 'auth', 1)
        return reply('your PIN has been successfully registered. Please enter the password to unlock the channels.')
      } else if (auth === '1') {
        if (!isPassword(str)) {
          return reply('the password is incorrect.')
        }
        await msg.member.addRole(process.env.MEMBER_ROLE_ID, 'Correct PIN and password')
        await db.hset(msg.author.id, 'auth', 2)
        return reply('you have successfully registered.')
      } else if (auth === '2') {
        return reply('you have already registered.')
      }
    } catch (err) {
      console.error(`Error assigning user ${msg.author.name} (${msg.author.id}) to PIN ${str}`)
      console.error(err)
      await reply('An error has occurred while verifying your PIN. Please contact an administrator.')
      return
    } finally {
      deleteDelay(msg, 5000)
    }
  }
}