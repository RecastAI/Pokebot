'use strict';

var toText = function toText(message) {
  return { type: 'text', content: message };
};
var u = require('../utils.js');

var getHelp = function getHelp() {
  var answers = ['You can ask me about a specific or random pokemon, or about a move.\n\nI know the stats of every pokemon, their resists, the moves they can learn and their evolution tree.\n\nExamples:\n\n• Show me Bulbasaur.\n\n• What can Bulbasaur learn?\n\n• Show me a random fire Pokemon'];
  return Promise.resolve([toText(u.random(answers)), toText('If you need anything, you can contact Recast.AI, my creators, at hello@recast.ai.')]);
};
module.exports = getHelp;