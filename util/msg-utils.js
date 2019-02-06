const createReplyWrapper = origMsg => (msg, file) => {
  return origMsg.channel.createMessage({
    content: `${origMsg.author.mention}, ${typeof msg === 'object' ? msg.content : msg}`,
    ...msg
  }, file).then(msg => setTimeout(() => msg.delete(), 10000))
}

const deleteDelay = (msg, delay) => {
  setTimeout(() => msg.delete().catch(err => {
    console.error(`Error deleting message from ${msg.author.username} (${msg.author.id}) with a ${delay}ms delay`)
    console.error(err)
  }), delay)
}

module.exports = {
  createReplyWrapper,
  deleteDelay
}