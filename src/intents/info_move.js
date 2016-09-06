const request = require('superagent')
const _ = require('lodash')
const u = require('../utils.js')

const infoMoveLayout = (move) => {
  const answer = [u.toText(`:mag_right: ${_.capitalize(move.name)}`)]
  let toAdd = ''
  if (move.power) {
    toAdd += `Power: ${move.power} :muscle:\n\n`
  }
  toAdd += `Type: ${_.capitalize(move.type.name)} - ${_.capitalize(move.damage_class.name)}\n\n`
  if (move.accuracy) { toAdd += `Accuracy: ${move.accuracy}\n\n` }
  toAdd += `PP: ${move.pp} \n\n`
  answer.push(u.toText(toAdd))
  const goodElem = _.find(move.effect_entries, (effect) => { return effect.language.name === 'en' })
  const description = move.effect_chance ? goodElem.effect.replace('$effect_chance', move.effect_chance) : goodElem.effect
  answer.push(u.toText(description))
  return (answer)
}

const getInfoMove = (entity) => {
  const move = entity ? entity.raw : 'noMove'
  if (move === 'noMove') { return Promise.reject([u.toText('You have to give me the name of a move.')]) }
  if (entity && entity.name === 'wrong') { return Promise.reject([u.toText(`The move ${entity.raw} does not exist... You might have mispelled it.`)]) }
  return new Promise((resolve, reject) => {
    request.get(`http://pokeapi.co/api/v2/move/${move}`)
    .end((err, res) => {
      if (err) { return reject([u.toText('Sorry, the Pokemon headquarters are down. Try again later!')]) }
      resolve(infoMoveLayout(res.body))
    })
  })
}

module.exports = getInfoMove
