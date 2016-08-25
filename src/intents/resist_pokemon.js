const request = require('superagent')
const _ = require('lodash')
const u = require('../utils.js')

const singleTypeLayout = (types, pokename) => {
  const answer = [u.toText(`:mag_right: ${_.capitalize(pokename)} resists`)]
  const result = [
    { types: types[0].damage_relations.half_damage_from.map(elem => elem.name), text: 'Resistances\n\n• ' },
    { types: types[0].damage_relations.double_damage_from.map(elem => elem.name), text: 'Weaknesses\n\n• ' },
    { types: types[0].damage_relations.no_damage_from.map(elem => elem.name), text: 'Insensibility\n\n• ' },
  ]
  result.forEach(elem => {
    if (elem.types.length > 0) { answer.push(u.toText(elem.text + elem.types.join('\n\n• '))) }
  })
  return (answer)

}

const doubleTypeLayout = (types, pokename) => {
  const answer = [u.toText(`:mag_right: ${_.capitalize(pokename)} resists`)]
  const weaknessConcat = types[0].damage_relations.double_damage_from.concat(types[1].damage_relations.double_damage_from).map(elem => elem.name)
  const resistConcat = types[0].damage_relations.half_damage_from.concat(types[1].damage_relations.half_damage_from).map(elem => elem.name)
  const inter = _.intersection(resistConcat, weaknessConcat)
  const resist = _.filter(resistConcat, type => inter.indexOf(type) === -1 && !u.isDuplicate(type, resistConcat))
  const resistPlus = u.delDuplicates(_.filter(resistConcat, type => u.isDuplicate(type, resistConcat)))
  const weakness = _.filter(weaknessConcat, type => inter.indexOf(type) === -1 && !u.isDuplicate(type, weaknessConcat))
  const weaknessPlus = u.delDuplicates(_.filter(weaknessConcat, type => u.isDuplicate(type, weaknessConcat)))
  const result = [
    { types: weaknessPlus, text: 'Weakness+\n\n• ' },
    { types: weakness, text: 'Weakness\n\n• ' },
    { types: resist, text: 'Resist\n\n• ' },
    { types: resistPlus, text: 'Resist+\n\n• ' },
    { types: _.union(types[0].damage_relations.no_damage_from, types[1].damage_relations.no_damage_from).map(elem => elem.name), text: 'Insensibility\n\n• ' },
  ]
  result.forEach(elem => {
    if (elem.types.length > 0) { answer.push(u.toText(elem.text + elem.types.join('\n\n• '))) }
  })
  return (answer)
}

const resistPokemonLayout = (types, pokename) => {
  if (types.length === 1) { return singleTypeLayout(types, pokename) }
  return doubleTypeLayout(types, pokename)
}

const getType = (type) => {
  return new Promise((resolve, reject) => {
    request.get(`http://pokeapi.co/api/v2/type/${type.type.name}`)
    .end((err, res) => {
      if (err) { return reject() }
      resolve(res.body)
    })
  })
}

const getTypes = (pokemon) => {
  return (new Promise((resolve, reject) => {
    const promises = []
    pokemon.types.forEach(type => { promises.push(getType(type)) })
    Promise.all(promises)
    .then(res => resolve(res))
    .catch(() => reject())
  }))
}

const getResistPokemon = (entity, user) => {
  const pokemon = entity ? entity.raw : user.pokemon
  if (!pokemon) { return Promise.reject([u.toText('Resists about which pokemon?')]) }
  if (entity && entity.name === 'wrong') { return Promise.reject([u.toText(`The pokemon ${entity.raw} does not exist... You might have mispelled it.`)]) }
  user.pokemon = pokemon
  return new Promise((resolve, reject) => {
    request.get(`http://pokeapi.co/api/v2/pokemon/${pokemon}`)
    .end((err, res) => {
      if (err) { return reject([u.toText('Sorry, the Pokemon headquarters are down. Try again later!')]) }
      getTypes(res.body)
      .then(typesRes => resolve(resistPokemonLayout(typesRes, pokemon)))
      .catch(() => reject([u.toText('Sorry, the Pokemon headquarters are down. Try again later!')]))
    })
  })
}

module.exports = getResistPokemon
