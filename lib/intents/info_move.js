'use strict';

var request = require('superagent');
var _ = require('lodash');
var u = require('../utils.js');

var infoMoveLayout = function infoMoveLayout(move) {
  var answer = [u.toText(':mag_right: ' + _.capitalize(move.name))];
  var toAdd = '';
  if (move.power) {
    toAdd += 'Power: ' + move.power + ' :muscle:\n\n';
  }
  toAdd += 'Type: ' + _.capitalize(move.type.name) + ' - ' + _.capitalize(move.damage_class.name) + '\n\n';
  if (move.accuracy) {
    toAdd += 'Accuracy: ' + move.accuracy + '\n\n';
  }
  toAdd += 'PP: ' + move.pp + ' \n\n';
  answer.push(u.toText(toAdd));
  var goodElem = _.find(move.effect_entries, function (effect) {
    return effect.language.name === 'en';
  });
  var description = move.effect_chance ? goodElem.effect.replace('$effect_chance', move.effect_chance) : goodElem.effect;
  answer.push(u.toText(description));
  return answer;
};

var getInfoMove = function getInfoMove(entity) {
  var move = entity ? entity.raw : 'noMove';
  if (move === 'noMove') {
    return Promise.reject([u.toText('You have to give me the name of a move.')]);
  }
  if (entity && entity.name === 'wrong') {
    return Promise.reject([u.toText('The move ' + entity.raw + ' does not exist... You might have mispelled it.')]);
  }
  return new Promise(function (resolve, reject) {
    request.get('http://pokeapi.co/api/v2/move/' + move).end(function (err, res) {
      if (err) {
        return reject([u.toText('Sorry, the Pokemon headquarters are down. Try again later!')]);
      }
      resolve(infoMoveLayout(res.body));
    });
  });
};

module.exports = getInfoMove;