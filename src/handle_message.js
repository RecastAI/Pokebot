// INTENTS IMPORT
const Fuzzy = require('fuzzy-matching')
const _ = require('lodash')
const builder = require('botbuilder')

const u = require('./utils')
const INTENTS = require('./intents')
const datas = require('./data.js')

const fmtypes = new Fuzzy(datas.types.concat('random'))
const fmmoves = new Fuzzy(datas.moves)
const fmpokemons = new Fuzzy(datas.pokemons)

const noMemoryIntents = [
  'neutral',
  'help',
  'greetings',
  'goodbyes',
  'feelings',
  'random',
  'infomove',
]

const notFoundAnswer = [
  'You\'re asking me too much! I\'m just a bot',
  'I won\'t help you about this.',
  'Sorry I cannot help you on this point..',
]

// SEND EITHER AN IMAGE / TEXT / BUTTONS
const actionsByMessageType = {
  image: (session, elem) => session.send(new builder.Message().addAttachment({
    contentType: 'image/png',
    contentUrl: elem.content,
  })),
  text: (session, elem) => session.send(elem.content),
  buttons: (session, elem) => {
    const buttons = elem.content.map(button => {
      return (new builder.CardAction().title(button.title).type('imBack').value(button.value))
    })
    const card = new builder.ThumbnailCard().buttons(buttons).subtitle(elem.title)
    session.send(new builder.Message().addAttachment(card))
  },
}

// Handle a message
const handleMessage = (session, res, user) => {
  if (user.new === true) {
    session.send(`Hey ${user.name}, nice to see you!`)
    session.send('Since it\'s your first time here, you can start by asking for information about Pikachu, or any Pokemon you like!\n\nExemple: What is Pikachu?')
  }
  let intent = res.intent()
  let entity = checkEntity(res)
  if (!intent) {
    if (!entity) { entity = checkWords(u.cleanText(res.source)) }
    if (entity && entity.name === 'pokemon') {
      intent = user.intent
    } else if (entity && entity.name === 'poketype') {
      intent = 'random'
    } else if (entity && entity.name === 'pokeattack') {
      intent = 'infomove'
    } else {
      session.send(notFoundAnswer)
    }
  }
  if (intent && noMemoryIntents.indexOf(intent) === -1) { user.intent = intent }
  if (intent && !(user.new && intent === 'greetings')) {
    INTENTS[intent](entity, user)
    .then((reply) => { reply.forEach((message) => actionsByMessageType[message.type](session, message)) })
    .catch((error) => { error.forEach((message) => actionsByMessageType[message.type](session, message)) })
  }
}

// CHECK IF ITS AN EXISTING POKEMON / MOVE / TYPE
const checkEntity = (recast) => {
  const poketype = recast.get('poketype')
  const pokemon = recast.get('pokemon')
  const pokeattack = recast.get('pokeattack')
  if (poketype) {
    const match = fmtypes.get(poketype.raw)
    if (match.distance < 0.7) {
      poketype.name = 'wrong'
    } else { poketype.raw = match.value }
    return poketype
  } else if (pokemon) {
    const splitPoke = pokemon.raw.split(/[ -]/)
    if (splitPoke.length > 1 && splitPoke[0].toLowerCase() === 'mega') { pokemon.raw = splitPoke[1] + splitPoke[0] }
    const match = fmpokemons.get(pokemon.raw)
    if (match.distance < 0.7) {
      pokemon.name = 'wrong'
    } else { pokemon.raw = match.value }
    return pokemon
  } else if (pokeattack) {
    const match = fmmoves.get(pokeattack.raw)
    if (match.distance < 0.7) {
      pokeattack.name = 'wrong'
    } else { pokeattack.raw = match.value }
    return pokeattack
  }
  return null
}

// CHECK IF THERE IS A POKEMON / MOVE / TYPE IN THE INPUT
const checkWords = (words) => {
  const split = words.split(' ')
  let entity = null
  let wordbefore = null
  split.forEach((word) => {
    const matches = [fmpokemons.get(word), fmmoves.get(word), fmtypes.get(word)]
    if (wordbefore) {
      const toAdd = (wordbefore.toLowerCase() === 'mega') ? (word + wordbefore) : (wordbefore + word)
      matches.push(fmmoves.get(toAdd))
      matches.push(fmpokemons.get(toAdd))
    }
    const bestMatch = _.maxBy(matches, match => { return match.distance })
    if (bestMatch.distance > 0.8) {
      entity = {}
      entity.raw = bestMatch.value
      if (matches.indexOf(bestMatch) === 0 || matches.indexOf(bestMatch) === 4) {
        entity.name = 'pokemon'
      } else if (matches.indexOf(bestMatch) === 1 || matches.indexOf(bestMatch) === 3) {
        entity.name = 'pokeattack'
      } else if (matches.indexOf(bestMatch) === 2) { entity.name = 'poketype' }
    }
    wordbefore = word
  })
  return (entity)
}

module.exports = handleMessage
