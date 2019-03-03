const { createReplyWrapper } = require('../../util/msg-utils')
const db = require('../../util/db')

module.exports = {
  admin: true,
  exec: async (msg, bot) => {
    // TODO: ALlow changing of prefix, channel and member IDs
    const args = msg.content.trim().split(' ').slice(1)

    if (args.length === 0) {
      const prefix = process.env.BOT_PREFIX
      return msg.channel.createMessage({
        content: [
          `To change a setting, send a message with the format \`${prefix}settings <option> <value>\`.`,
          'You can find the options name in the brackets below (e.g. `prefix`).',
          `Don't include the \`<>\` brackets!`,
          `Example command: \`${prefix}settings prefix d!\``
        ].join('\n'),
        embed: {
          'color': 3003711,
          'title': '**Bot Settings**',
          'fields': [
            {
              'name': 'Bot Prefix (prefix)',
              'value': `\`${prefix}\``
            },
            {
              'name': '#welcome channel (welcome)',
              'value': `<#${process.env.WELCOME_CHANNEL_ID}>`,
              'inline': true
            },
            {
              'name': '#rules channel (rules)',
              'value': `<#${process.env.RULES_CHANNEL_ID}>`,
              'inline': true
            },
            {
              'name': 'Member Role (member)',
              'value': `<@&${process.env.MEMBER_ROLE_ID}>`,
              'inline': true
            }
          ]
        }
      })
    }

    const reply = createReplyWrapper(msg, false)
    if (args.length === 1) {
      switch (args[0]) {
        case 'prefix':
        case 'botprefix': {
          return reply(`the bot's prefix is \`${process.env.BOT_PREFIX}\``)
        }
        case 'member':
        case 'memberrole':
        case 'role': {
          const id = process.env.MEMBER_ROLE_ID
          const role = msg.channel.guild.roles.find(role => role.id === id).name
          return reply(`the member role is '${role}' (ID: \`${id}\`)`)
        }
        case 'welcome': {
          const id = process.env.WELCOME_CHANNEL_ID
          return reply(`the welcome channel is <#${id}> (ID: \`${id}\`)`)
        }
        case 'rules': {
          const id = process.env.RULES_CHANNEL_ID
          return reply(`the rules channel is <#${id}> (ID: \`${id}\`)`)
        }
      }
    }

    if (args.length === 2) {
      // TODO: Add support for names of roles and channels instead of only IDs
      switch (args[0]) {
        case 'prefix':
        case 'botprefix': {
          const prefix = args[1]
          await db.set('settings:prefix', prefix)
          process.env.BOT_PREFIX = prefix
          return reply(`the bot prefix is now \`${prefix}\``)
        }
        case 'member':
        case 'memberrole':
        case 'role': {
          const id = args[1]
          if (!msg.channel.guild.roles.find(role => role.id === id)) {
            return reply(`I could not find a role with ID \`${id}\`.`)
          }
          await db.set('settings:roleId', id)
          process.env.MEMBER_ROLE_ID = id
          return reply(`the member role is now \`${id}\``)
        }
        case 'welcome': {
          const id = args[1]
          if (!msg.channel.guild.channels.find(channel => channel.id === id)) {
            return reply(`I could not find a channel with ID \`${id}\`.`)
          }
          await db.set('settings:welcomeChannelId', id)
          process.env.WELCOME_CHANNEL_ID = id
          return reply(`the welcome channel is now <#${id}>`)
        }
        case 'rules': {
          const id = args[1]
          if (!msg.channel.guild.channels.find(channel => channel.id === id)) {
            return reply(`I could not find a channel with ID \`${id}\`.`)
          }
          await db.set('settings:rulesChannelId', id)
          process.env.RULES_CHANNEL_ID = id
          return reply(`the rules channel is now <#${id}>`)
        }
      }
    }
  }
}