const createReplyWrapper = origMsg => (msg, delay = 5000, file) => {
  return origMsg.channel.createMessage({
    content: `${origMsg.author.mention}, ${typeof msg === 'object' ? msg.content : msg}`,
    ...msg
  }, file).then(msg => delay === false ? null : setTimeout(() => msg.delete(), delay))
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
