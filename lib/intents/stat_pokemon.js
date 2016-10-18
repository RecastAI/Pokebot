'use strict';

var request = require('superagent');
var _ = require('lodash');
var u = require('../utils.js');

var statPokemonLayout = function statPokemonLayout(pokemon) {
  var answer = [u.toText(':mag_right: ' + _.capitalize(pokemon.name) + ' stats')];
  answer.push(u.toText(pokemon.stats.map(function (elem) {
    return ':small_orange_diamond: ' + _.capitalize(elem.stat.name) + ' : ' + elem.base_stat + '\n\n';
  }).join('\n\n')));
  return answer;
};

var getStatPokemon = function getStatPokemon(entity, user) {
  var pokemon = entity ? entity.raw : user.pokemon;
  if (!pokemon) {
    return Promise.reject([u.toText('Stats of which pokemon?')]);
  }
  if (entity && entity.name === 'wrong') {
    return Promise.reject([u.toText('The pokemon ' + entity.raw + ' does not exist... You might have mispelled it.')]);
  }
  user.pokemon = pokemon;
  return new Promise(function (resolve, reject) {
    request.get('http://pokeapi.co/api/v2/pokemon/' + pokemon).end(function (err, res) {
      if (err) {
        return reject([u.toText('Sorry, the Pokemon headquarters are down. Try again later!')]);
      }
      resolve(statPokemonLayout(res.body));
    });
  });
};

module.exports = getStatPokemon;