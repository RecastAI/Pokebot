const request = require('superagent')
const gender = ['neutral', 'Female', 'Male']
const _ = require('lodash')
const u = require('../utils.js')

const chooseGoodWay = (way) => {
  let answer = ''
  if (way.trigger.name === 'level-up' && way.min_level) { answer += `lvl ${way.min_level} ` }
  if (way.trigger.name === 'level-up' && !way.min_level) { answer += 'lvl up ' }
  if (way.trigger.name === 'trade') { answer += 'Trade ' }
  if (way.trigger.name === 'use-item') { answer += 'Use ' }
  if (way.trade_species) { answer += `for ${_.capitalize(way.trade_species.name)} ` }
  if (way.time_of_day) { answer += `during the ${_.capitalize(way.time_of_day)} ` }
  if (way.item) { answer += `${_.capitalize(way.item.name.replace(/-/gi, ' '))} ` }
  if (way.held_item) { answer += `while holding ${_.capitalize(way.held_item.name.replace(/-/gi, ' '))} ` }
  if (way.min_happiness) { answer += `+ min happiness ${way.min_happiness} ` }
  if (way.min_beauty) { answer += `+ min beauty ${way.min_beauty} ` }
  if (way.min_affection) { answer += `+ min affection ${way.min_affection} ` }
  if (way.turn_upside_down) { answer += 'while holding 3DS upside down ' }
  if (way.location) { answer += `while being in ${_.capitalize(way.location.name.replace(/-/gi, ' '))} ` }
  if (way.known_move) { answer += `+ know the move ${_.capitalize(way.known_move.name)} ` }
  if (way.known_move_type) { answer += `+ know a move of type ${_.capitalize(way.known_move_type.name)} ` }
  if (way.party_species) { answer += `with a ${_.capitalize(way.party_species.name)} in the team ` }
  if (way.party_type) { answer += `with a pokemon of type ${_.capitalize(way.party_type.name)} in the team ` }
  if (way.needs_overworld_rain) { answer += 'under the rain ' }
  if (way.relative_physical_stats === 0) { answer += '+ Attack = Defense ' }
  if (way.relative_physical_stats === 1) { answer += '+ Attack > Defense ' }
  if (way.relative_physical_stats === -1) { answer += '+ Attack < Defense ' }
  if (way.gender) { answer += `(${gender[way.gender]} only) ` }
  return answer
}

const getFamily = (curpoke, family, branch) => {
  const info = { name: curpoke.species.name }
  if (curpoke.evolution_details.length !== 0) { info.way = chooseGoodWay(curpoke.evolution_details[0]) }
  branch.push(info)
  if (curpoke.evolves_to.length === 0) { family.push(branch) }
  curpoke.evolves_to.forEach((elem) => { getFamily(elem, family, branch.slice(0, branch.length)) })
}

const evoPokemonLayout = (res, pokemon) => {
  const answer = [u.toText(`:mag_right: ${_.capitalize(pokemon)} family`)]
  let toAdd = ''
  const family = []
  const buttons = []
  getFamily(res.chain, family, [])
  family.forEach((branch) => {
    branch.forEach((poke) => {
      toAdd += `:small_orange_diamond: ${_.capitalize(poke.name)}`
      if (poke.way) { toAdd += ` -> ${poke.way}` }
      toAdd += '\n\n'
      if (poke.name !== pokemon) {
        buttons.push(u.toButton(_.capitalize(poke.name), `Show me ${poke.name}`))
      }
    })
    answer.push(u.toText(toAdd))
    toAdd = ''
  })
  if (buttons.length > 0) { answer.push(u.toButtons('See more about them', buttons)) }
  return answer
}

const getEvoPokemon = (entity, user) => {
  const pokemon = entity ? entity.raw : user.pokemon
  if (!pokemon) { return Promise.reject([u.toText('Evolution chain of which pokemon?')]) }
  if (entity && entity.name === 'wrong') { return Promise.reject([u.toText(`The pokemon ${entity.raw} does not exist... You might have mispelled it.`)]) }
  user.pokemon = pokemon
  return new Promise((resolve, reject) => {
    request.get(`http://pokeapi.co/api/v2/pokemon-species/${pokemon}`)
    .end((err, res) => {
      if (err) { return reject([u.toText('Sorry, the Pokemon headquarters are down. Try again later!')]) }
      request.get(res.body.evolution_chain.url)
      .end((err2, res2) => {
        if (err2) { return reject([u.toText('Sorry, the Pokemon headquarters are down. Try again later!')]) }
        resolve(evoPokemonLayout(res2.body, pokemon))
      })
    })
  })
}

module.exports = getEvoPokemon
