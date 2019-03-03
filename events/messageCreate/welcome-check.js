const db = require('../../util/db')
const { createReplyWrapper } = require('../../util/msg-utils')

const checkValidPIN = async str => {
  const res = await db.get(`pin:${str}`)
  return res && res === '0'
}

const isPassword = str => {
  // TODO: Editable password?
  if (str.toLowerCase() === 'i agree') return true
  return false
}

module.exports = async (msg, bot) => {
  if (msg.author.id === bot.user.id) return
  if (msg.author.bot) return
  if (msg.channel.type === 1) return

  const isWelcomeChannel = msg.channel.id === process.env.WELCOME_CHANNEL_ID
  const isRulesChannel = msg.channel.id === process.env.RULES_CHANNEL_ID

  if (!isWelcomeChannel && !isRulesChannel) return

  const reply = createReplyWrapper(msg)

  const str = msg.content.trim().toLowerCase()
  const userKey = `user:${msg.author.id}`

  try {
    if (isWelcomeChannel) {
      const auth = await db.hget(userKey, 'auth')
      const isPINValid = await checkValidPIN(str)
      if (auth !== '1') {
        if (!isPINValid) {
          return reply('the PIN is invalid. Please use a valid PIN.')
        }
        await db.multi()
          .hmset(userKey, 'pin', str)
          .hincrby(userKey, 'auth', 1)
          .set(`pin:${str}`, 1)
          .exec()
        await reply(`your PIN has been successfully registered.`)
      }
    } else if (isRulesChannel) {
      const pass = await db.hget(userKey, 'pass')
      if (pass !== '1') {
        if (!isPassword(str)) {
          return reply('the password is incorrect.')
        }
        await msg.member.addRole(process.env.MEMBER_ROLE_ID, 'Correct PIN and password')
        await db.multi()
          .hset(userKey, 'auth', 2)
          .hincrby(userKey, 'pass', 1)
          .exec()
        return reply('you have agreed to the rules.')
      }
    }
  } catch (err) {
    console.error(`Error saving details of user ${msg.author.username} (${msg.author.id})`)
    console.error(err)
    await reply('An error has occurred while verifying your response. Please contact an administrator.')
    return
  } finally {
    msg.delete().catch(() => {})
  }
}