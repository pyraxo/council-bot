const Redis = require('ioredis')

const port = process.env.REDIS_PORT || 6379
const host = process.env.REDIS_HOST || '127.0.0.1'

const client = new Redis(port, host)

client.on('ready', async () => {
  console.log(`Redis client has connected to ${host}:${port}`)
})

module.exports = client

/*

PIN
  - id: discord USER ID
  - stage: 1 => PIN, 2 => PW, 3 => registered

*/