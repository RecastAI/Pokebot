'use strict';

var toText = function toText(message) {
  return { type: 'text', content: message };
};
var u = require('../utils.js');

var getNeutral = function getNeutral() {
  var answers = [';)', ';p', 'Lol', 'Ahahah'];
  return Promise.resolve([toText(u.random(answers))]);
};
module.exports = getNeutral;