const request = require('superagent')
const _ = require('lodash')
const u = require('../utils.js')

const getCleanMoves = (version, pokemon) => {
  const moves = []
  pokemon.moves.forEach((move) => {
    const goodElem = _.find(move.version_group_details, (subelem) => subelem.version_group.name === 'x-y' && subelem.move_learn_method.name === 'level-up')
    if (goodElem) { moves.push({ name: move.move.name, lvl: goodElem.level_learned_at }) }
  })
  const sortedMoves = _.sortBy(moves, (move) => move.lvl)
  return sortedMoves
}

const movePokemonLayout = (pokemon) => {
  const answer = [u.toText(`:mag_right: ${_.capitalize(pokemon.name)} moves`)]
  const moves = getCleanMoves('x-y', pokemon)
  const buttons = moves.map((move) => {
    return u.toButton(`${move.lvl} ${_.capitalize(move.name)} \n\n`, `show me the move ${_.capitalize(move.name)}`)
  })
  answer.push(u.toButtons('Moves, sorted by lvl', buttons))
  return answer
}

const getMovePokemon = (entity, user) => {
  const pokemon = entity ? entity.raw : user.pokemon
  if (!pokemon) { return Promise.reject([u.toText('Moves of which pokemon?')]) }
  if (entity && entity.name === 'wrong') { return Promise.reject([u.toText(`The pokemon ${entity.raw} does not exist... You might have mispelled it.`)]) }
  user.pokemon = pokemon
  return new Promise((resolve, reject) => {
    request.get(`http://pokeapi.co/api/v2/pokemon/${pokemon}`)
    .end((err, res) => {
      if (err) { return reject([u.toText('Sorry, the Pokemon headquarters are down. Try again later!')]) }
      resolve(movePokemonLayout(res.body))
    })
  })
}

module.exports = getMovePokemon
