// MODULES IMPORT
const recast = require('recastai')
const restify = require('restify')
const builder = require('botbuilder')

const config = require('../config.js')
const handleMessage = require('./handle_message')

// RECAST.AI INIT
const recastClient = new recast.Client(config.recast)

// CONNECTION TO MICROSOFT BOT
const connector = new builder.ChatConnector({
  appId: config.appid,
  appPassword: config.secret,
})
const bot = new builder.UniversalBot(connector)

const getUser = (address, session) => {
  const user = session.userData
  if (!user.done) {
    user.Id = address.user.id
    user.channelID = address.channelId
    user.name = address.user.name.split(' ')[0]
    user.intent = 'infopokemon'
    user.done = true
    user.new = true
  } else {
    user.new = false
  }
  return (user)
}

// MESSAGE RECEIVED
bot.dialog('/', (session) => {
  const user = getUser(session.message.address, session)
  recastClient.textRequest(session.message.text)
  .then((res) => {
    handleMessage(session, res, user)
  })
  .catch(() => {
    session.send('I need some sleep right now... Talk to me later!')
  })
})

// Setup Restify Server
const server = restify.createServer()
server.listen(config.port)
server.post('/', connector.listen())
