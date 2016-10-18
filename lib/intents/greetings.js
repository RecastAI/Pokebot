'use strict';

var toText = function toText(message) {
  return { type: 'text', content: message };
};
var u = require('../utils.js');

var getGreetings = function getGreetings(res, user) {
  var answers = ['Hello ' + user.name + '!', 'Yo ' + user.name + ' ;)', 'Hey ' + user.name + ', nice to see you.', 'Welcome back ' + user.name + '!', 'Hi ' + user.name + ', how can I help you?', 'Hey ' + user.name + ', what do you need?'];
  return Promise.resolve([toText(u.random(answers))]);
};
module.exports = getGreetings;