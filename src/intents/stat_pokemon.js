const request = require('superagent')
const _ = require('lodash')
const u = require('../utils.js')

const statPokemonLayout = (pokemon) => {
  const answer = [u.toText(`:mag_right: ${_.capitalize(pokemon.name)} stats`)]
  answer.push(u.toText(pokemon.stats.map((elem) => `:small_orange_diamond: ${_.capitalize(elem.stat.name)} : ${elem.base_stat}\n\n`).join('\n\n')))
  return answer
}

const getStatPokemon = (entity, user) => {
  const pokemon = entity ? entity.raw : user.pokemon
  if (!pokemon) { return Promise.reject([u.toText('Stats of which pokemon?')]) }
  if (entity && entity.name === 'wrong') { return Promise.reject([u.toText(`The pokemon ${entity.raw} does not exist... You might have mispelled it.`)]) }
  user.pokemon = pokemon
  return new Promise((resolve, reject) => {
    request.get(`http://pokeapi.co/api/v2/pokemon/${pokemon}`)
    .end((err, res) => {
      if (err) { return reject([u.toText('Sorry, the Pokemon headquarters are down. Try again later!')]) }
      resolve(statPokemonLayout(res.body))
    })
  })
}

module.exports = getStatPokemon
