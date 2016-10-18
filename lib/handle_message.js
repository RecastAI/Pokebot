'use strict';

// INTENTS IMPORT
var Fuzzy = require('fuzzy-matching');
var _ = require('lodash');
var builder = require('botbuilder');

var u = require('./utils');
var INTENTS = require('./intents');
var datas = require('./data.js');

var fmtypes = new Fuzzy(datas.types.concat('random'));
var fmmoves = new Fuzzy(datas.moves);
var fmpokemons = new Fuzzy(datas.pokemons);

var noMemoryIntents = ['neutral', 'help', 'greetings', 'goodbyes', 'feelings', 'random', 'infomove'];

var notFoundAnswer = ['You\'re asking me too much! I\'m just a bot', 'I won\'t help you about this.', 'Sorry I cannot help you on this point..'];

// SEND EITHER AN IMAGE / TEXT / BUTTONS
var actionsByMessageType = {
  image: function image(session, elem) {
    return session.send(new builder.Message().addAttachment({
      contentType: 'image/png',
      contentUrl: elem.content
    }));
  },
  text: function text(session, elem) {
    return session.send(elem.content);
  },
  buttons: function buttons(session, elem) {
    var buttons = elem.content.map(function (button) {
      return new builder.CardAction().title(button.title).type('imBack').value(button.value);
    });
    var card = new builder.ThumbnailCard().buttons(buttons).subtitle(elem.title);
    session.send(new builder.Message().addAttachment(card));
  }
};

// Handle a message
var handleMessage = function handleMessage(session, res, user) {
  if (user.new === true) {
    session.send('Hey ' + user.name + ', nice to see you!');
    session.send('Since it\'s your first time here, you can start by asking for information about Pikachu, or any Pokemon you like!\n\nExemple: What is Pikachu?');
  }
  var intent = res.intent();
  var entity = checkEntity(res);
  if (!intent) {
    if (!entity) {
      entity = checkWords(u.cleanText(res.source));
    }
    if (entity && entity.name === 'pokemon') {
      intent.slug = user.intent;
    } else if (entity && entity.name === 'poketype') {
      intent.slug = 'random';
    } else if (entity && entity.name === 'pokeattack') {
      intent.slug = 'infomove';
    } else {
      session.send(notFoundAnswer);
    }
  }
  if (intent && noMemoryIntents.indexOf(intent.slug) === -1) {
    user.intent = intent.slug;
  }
  if (intent && !(user.new && intent.slug === 'greetings')) {
    INTENTS[intent.slug](entity, user).then(function (reply) {
      reply.forEach(function (message) {
        return actionsByMessageType[message.type](session, message);
      });
    }).catch(function (error) {
      error.forEach(function (message) {
        return actionsByMessageType[message.type](session, message);
      });
    });
  }
};

// CHECK IF ITS AN EXISTING POKEMON / MOVE / TYPE
var checkEntity = function checkEntity(recast) {
  var poketype = recast.get('poketype');
  var pokemon = recast.get('pokemon');
  var pokeattack = recast.get('pokeattack');
  if (poketype) {
    var match = fmtypes.get(poketype.raw);
    if (match.distance < 0.7) {
      poketype.name = 'wrong';
    } else {
      poketype.name = 'poketype';
      poketype.raw = match.value;
    }
    return poketype;
  } else if (pokemon) {
    var splitPoke = pokemon.raw.split(/[ -]/);
    if (splitPoke.length > 1 && splitPoke[0].toLowerCase() === 'mega') {
      pokemon.raw = splitPoke[1] + splitPoke[0];
    }
    var _match = fmpokemons.get(pokemon.raw);
    if (_match.distance < 0.7) {
      pokemon.name = 'wrong';
    } else {
      pokemon.name = 'pokemon';
      pokemon.raw = _match.value;
    }
    return pokemon;
  } else if (pokeattack) {
    var _match2 = fmmoves.get(pokeattack.raw);
    if (_match2.distance < 0.7) {
      pokeattack.name = 'wrong';
    } else {
      pokeattack.name = 'pokeattack';
      pokeattack.raw = _match2.value;
    }
    return pokeattack;
  }
  return null;
};

// CHECK IF THERE IS A POKEMON / MOVE / TYPE IN THE INPUT
var checkWords = function checkWords(words) {
  var split = words.split(' ');
  var entity = null;
  var wordbefore = null;
  split.forEach(function (word) {
    var matches = [fmpokemons.get(word), fmmoves.get(word), fmtypes.get(word)];
    if (wordbefore) {
      var toAdd = wordbefore.toLowerCase() === 'mega' ? word + wordbefore : wordbefore + word;
      matches.push(fmmoves.get(toAdd));
      matches.push(fmpokemons.get(toAdd));
    }
    var bestMatch = _.maxBy(matches, function (match) {
      return match.distance;
    });
    if (bestMatch.distance > 0.8) {
      entity = {};
      entity.raw = bestMatch.value;
      if (matches.indexOf(bestMatch) === 0 || matches.indexOf(bestMatch) === 4) {
        entity.name = 'pokemon';
      } else if (matches.indexOf(bestMatch) === 1 || matches.indexOf(bestMatch) === 3) {
        entity.name = 'pokeattack';
      } else if (matches.indexOf(bestMatch) === 2) {
        entity.name = 'poketype';
      }
    }
    wordbefore = word;
  });
  return entity;
};

module.exports = handleMessage;