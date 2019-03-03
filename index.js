require('dotenv').config()
const requireAll = require('require-all')
const Client = require('eris')

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

  const args = msg.content.trim().split(' ')

  // Skip message if it's not a command (prefixed)
  const prefix = process.env.BOT_PREFIX
  if (!args[0].startsWith(prefix)) return

  const cmd = args[0].substr(0, prefix.length)

  botCommands.forEach((command, commandKey) => {
    if (command.admin === true && !msg.member.roles.find(id => id === process.env.ADMIN_ROLE_ID)) return
    const [group, name] = commandKey.split(':')
    if (cmd !== name) return
    command.exec(msg, bot).catch(err => {
      console.error(`Error running command ${name} of group ${group}`)
      console.error(err)
    })
  })
})

bot.on('ready', async () => {
  console.log(`${bot.user.username} is ready`)
  console.log(`${bot.guilds.size} guilds and ${bot.users.size} users`)
  console.log(`${botCommands.size} commands and ${eventListeners.size} events`)
})

bot.connect()
