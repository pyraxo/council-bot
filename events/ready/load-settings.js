const db = require('../../util/db')
const { checkAllPINs } = require('../../util/pin-utils')

// TODO: Tidy up
module.exports = async (bot) => {
  checkAllPINs()
    .then(count => console.log(`All PINs loaded, ${count} newly added`))
    .catch(err => console.error('Could not save PINs', err))
  
  const [
    welcomeChannelId, rulesChannelId, pinsChannelId, roleId, botPrefix
  ] = await db.mget(...[
    'welcomeChannelId', 'rulesChannelId', 'pinsChannelId', 'roleId', 'prefix'
  ].map(s => `settings:${s}`))

  if (welcomeChannelId) {
    console.log(`Using stored welcome channel ID ${welcomeChannelId} instead of ${process.env.WELCOME_CHANNEL_ID}`)
    process.env.WELCOME_CHANNEL_ID = welcomeChannelId
  } else if (process.env.WELCOME_CHANNEL_ID) {
    console.log(`Using welcome channel ID ${process.env.WELCOME_CHANNEL_ID} from .env`)
  }

  if (rulesChannelId) {
    console.log(`Using stored rules channel ID ${rulesChannelId} instead of ${process.env.RULES_CHANNEL_ID}`)
    process.env.RULES_CHANNEL_ID = rulesChannelId
  } else if (process.env.RULES_CHANNEL_ID) {
    console.log(`Using rules channel ID ${process.env.RULES_CHANNEL_ID} from .env`)
  }

  if (pinsChannelId) {
    console.log(`Using stored PINs channel ID ${pinsChannelId} instead of ${process.env.PINS_CHANNEL_ID}`)
    process.env.PINS_CHANNEL_ID = pinsChannelId
  } else if (process.env.PINS_CHANNEL_ID) {
    console.log(`Using PINs channel ID ${process.env.PINS_CHANNEL_ID} from .env`)
  }

  if (roleId) {
    console.log(`Using stored member role ID ${roleId} instead of ${process.env.MEMBER_ROLE_ID}`)
    process.env.MEMBER_ROLE_ID = roleId
  } else if (process.env.MEMBER_ROLE_ID) {
    console.log(`Using member role ID ${process.env.MEMBER_ROLE_ID} from .env`)
  }

  if (botPrefix) {
    console.log(`Using stored bot prefix ${botPrefix} instead of ${process.env.BOT_PREFIX}`)
    process.env.BOT_PREFIX = botPrefix
  } else if (process.env.BOT_PREFIX) {
    console.log(`Using stored bot prefix ${process.env.BOT_PREFIX} from .env`)
  }
}
