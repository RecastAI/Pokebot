'use strict';

var request = require('superagent');
var _ = require('lodash');
var u = require('../utils.js');

var singleTypeLayout = function singleTypeLayout(types, pokename) {
  var answer = [u.toText(':mag_right: ' + _.capitalize(pokename) + ' resists')];
  var result = [{ types: types[0].damage_relations.half_damage_from.map(function (elem) {
      return elem.name;
    }), text: 'Resistances\n\n• ' }, { types: types[0].damage_relations.double_damage_from.map(function (elem) {
      return elem.name;
    }), text: 'Weaknesses\n\n• ' }, { types: types[0].damage_relations.no_damage_from.map(function (elem) {
      return elem.name;
    }), text: 'Insensibility\n\n• ' }];
  result.forEach(function (elem) {
    if (elem.types.length > 0) {
      answer.push(u.toText(elem.text + elem.types.join('\n\n• ')));
    }
  });
  return answer;
};

var doubleTypeLayout = function doubleTypeLayout(types, pokename) {
  var answer = [u.toText(':mag_right: ' + _.capitalize(pokename) + ' resists')];
  var weaknessConcat = types[0].damage_relations.double_damage_from.concat(types[1].damage_relations.double_damage_from).map(function (elem) {
    return elem.name;
  });
  var resistConcat = types[0].damage_relations.half_damage_from.concat(types[1].damage_relations.half_damage_from).map(function (elem) {
    return elem.name;
  });
  var inter = _.intersection(resistConcat, weaknessConcat);
  var resist = _.filter(resistConcat, function (type) {
    return inter.indexOf(type) === -1 && !u.isDuplicate(type, resistConcat);
  });
  var resistPlus = u.delDuplicates(_.filter(resistConcat, function (type) {
    return u.isDuplicate(type, resistConcat);
  }));
  var weakness = _.filter(weaknessConcat, function (type) {
    return inter.indexOf(type) === -1 && !u.isDuplicate(type, weaknessConcat);
  });
  var weaknessPlus = u.delDuplicates(_.filter(weaknessConcat, function (type) {
    return u.isDuplicate(type, weaknessConcat);
  }));
  var result = [{ types: weaknessPlus, text: 'Weakness+\n\n• ' }, { types: weakness, text: 'Weakness\n\n• ' }, { types: resist, text: 'Resist\n\n• ' }, { types: resistPlus, text: 'Resist+\n\n• ' }, { types: _.union(types[0].damage_relations.no_damage_from, types[1].damage_relations.no_damage_from).map(function (elem) {
      return elem.name;
    }), text: 'Insensibility\n\n• ' }];
  result.forEach(function (elem) {
    if (elem.types.length > 0) {
      answer.push(u.toText(elem.text + elem.types.join('\n\n• ')));
    }
  });
  return answer;
};

var resistPokemonLayout = function resistPokemonLayout(types, pokename) {
  if (types.length === 1) {
    return singleTypeLayout(types, pokename);
  }
  return doubleTypeLayout(types, pokename);
};

var getType = function getType(type) {
  return new Promise(function (resolve, reject) {
    request.get('http://pokeapi.co/api/v2/type/' + type.type.name).end(function (err, res) {
      if (err) {
        return reject();
      }
      resolve(res.body);
    });
  });
};

var getTypes = function getTypes(pokemon) {
  return new Promise(function (resolve, reject) {
    var promises = [];
    pokemon.types.forEach(function (type) {
      promises.push(getType(type));
    });
    Promise.all(promises).then(function (res) {
      return resolve(res);
    }).catch(function () {
      return reject();
    });
  });
};

var getResistPokemon = function getResistPokemon(entity, user) {
  var pokemon = entity ? entity.raw : user.pokemon;
  if (!pokemon) {
    return Promise.reject([u.toText('Resists about which pokemon?')]);
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
      getTypes(res.body).then(function (typesRes) {
        return resolve(resistPokemonLayout(typesRes, pokemon));
      }).catch(function () {
        return reject([u.toText('Sorry, the Pokemon headquarters are down. Try again later!')]);
      });
    });
  });
};

module.exports = getResistPokemon;