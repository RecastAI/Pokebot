const request = require('superagent')
const types = require('../data.js').types
const u = require('../utils.js')
const getInfoPokemon = require('./info_pokemon')

const getRandomPokemon = (entity, user) => {
  let type = entity ? entity.raw : 'random'
  user.intent = 'info_pokemon'
  if (entity && entity.name === 'wrong') { return Promise.reject([u.toText(entity.raw + ' type does not exist... You might have mispelled it.')]) }
  if (type === 'random') { type = u.random(types) }
  return new Promise((resolve, reject) => {
    request.get(`http://pokeapi.co/api/v2/type/${type}`)
    .end((err, res) => {
      if (err) { return Promise.reject([u.toText('Sorry, the Pokemon headquarters are down. Try again later!')]) }
      const randomPoke = u.random(res.body.pokemon).pokemon.name
      const entity = { name: 'pokemon', raw: randomPoke }
      getInfoPokemon(entity, user)
      .then(res2 => resolve(res2))
      .catch(err2 => reject(err2))
    })
  })
}

module.exports = getRandomPokemon
