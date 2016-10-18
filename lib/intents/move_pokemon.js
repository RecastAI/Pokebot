'use strict';

var request = require('superagent');
var _ = require('lodash');
var u = require('../utils.js');

var getCleanMoves = function getCleanMoves(version, pokemon) {
  var moves = [];
  pokemon.moves.forEach(function (move) {
    var goodElem = _.find(move.version_group_details, function (subelem) {
      return subelem.version_group.name === 'x-y' && subelem.move_learn_method.name === 'level-up';
    });
    if (goodElem) {
      moves.push({ name: move.move.name, lvl: goodElem.level_learned_at });
    }
  });
  var sortedMoves = _.sortBy(moves, function (move) {
    return move.lvl;
  });
  return sortedMoves;
};

var movePokemonLayout = function movePokemonLayout(pokemon) {
  var answer = [u.toText(':mag_right: ' + _.capitalize(pokemon.name) + ' moves')];
  var moves = getCleanMoves('x-y', pokemon);
  var buttons = moves.map(function (move) {
    return u.toButton(move.lvl + ' ' + _.capitalize(move.name) + ' \n\n', 'show me the move ' + _.capitalize(move.name));
  });
  answer.push(u.toButtons('Moves, sorted by lvl', buttons));
  return answer;
};

var getMovePokemon = function getMovePokemon(entity, user) {
  var pokemon = entity ? entity.raw : user.pokemon;
  if (!pokemon) {
    return Promise.reject([u.toText('Moves of which pokemon?')]);
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
      resolve(movePokemonLayout(res.body));
    });
  });
};

module.exports = getMovePokemon;