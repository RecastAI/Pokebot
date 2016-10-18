'use strict';

var request = require('superagent');
var types = require('../data.js').types;
var u = require('../utils.js');
var getInfoPokemon = require('./info_pokemon');

var getRandomPokemon = function getRandomPokemon(entity, user) {
  var type = entity ? entity.raw : 'random';
  user.intent = 'info_pokemon';
  if (entity && entity.name === 'wrong') {
    return Promise.reject([u.toText(entity.raw + ' type does not exist... You might have mispelled it.')]);
  }
  if (type === 'random') {
    type = u.random(types);
  }
  return new Promise(function (resolve, reject) {
    request.get('http://pokeapi.co/api/v2/type/' + type).end(function (err, res) {
      if (err) {
        return Promise.reject([u.toText('Sorry, the Pokemon headquarters are down. Try again later!')]);
      }
      var randomPoke = u.random(res.body.pokemon).pokemon.name;
      var entity = { name: 'pokemon', raw: randomPoke };
      getInfoPokemon(entity, user).then(function (res2) {
        return resolve(res2);
      }).catch(function (err2) {
        return reject(err2);
      });
    });
  });
};

module.exports = getRandomPokemon;