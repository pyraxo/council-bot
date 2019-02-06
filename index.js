require('dotenv').config()
const requireAll = require('require-all')
const Client = require('eris')

const db = require('./util/db')
const commands = requireAll(`${__dirname}/commands`)
const events = requireAll(`${__dirname}/events`)

const bot = Client(process.env.BOT_TOKEN)

let eventListeners = new Map()
let botCommands = new Map()

for (const groupName in commands) {
  const commandMap = commands[groupName]
  for (const name in commandMap) {
    const func = commandMap[name]
    botCommands.set(`${groupName}:${name}`, func)
  }
}

for (const eventName in events) {
  const eventMap = events[eventName]
  const eventListener = (...args) => {
    for (const name in eventMap) {
      eventMap[name](...args, bot)
    }
  }
  bot.on(eventName, eventListener)
  eventListeners.set(eventName, eventListener)
}

bot.on('messageCreate', msg => {
  // Skips message if it's sent by the bot itself
  if (msg.author.id === bot.user.id) return

  // Skip message if it's not a command (prefixed)
  if (!msg.content.startsWith(process.env.BOT_PREFIX)) return

  botCommands.forEach((command, commandKey) => {
    // TODO: Check perms
    command.exec(msg, bot).catch(err => {
      const [group, name] = commandKey.split(':')
      console.error(`Error running command ${name} of group ${group}`)
      console.error(err)
    })
  })
})

bot.on('ready', async () => {
  console.log(`${bot.user.username} is ready, with ${botCommands.size} commands and ${eventListeners.size} events`)
  const [
    channelId, roleId, botPrefix
  ] = await db.mget(...['channelId', 'roleId', 'prefix'].map(s => `${bot.user.id}:${s}`))
  const multi = db.multi()
  if (channelId) {
    console.log(`Using stored welcome channel ID ${channelId} instead of ${process.env.WELCOME_CHANNEL_ID}`)
    process.env.WELCOME_CHANNEL_ID = channelId
  }
  if (roleId) {
    console.log(`Using stored member role ID ${roleId} instead of ${process.env.MEMBER_ROLE_ID}`)
    process.env.MEMBER_ROLE_ID = roleId
  }
  if (botPrefix) {
    console.log(`Using stored bot prefix ${roleId} instead of ${process.env.BOT_PREFIX}`)
    process.env.BOT_PREFIX = botPrefix
  }
})

bot.connect()