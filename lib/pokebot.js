'use strict';

// MODULES IMPORT
var recast = require('recastai');
var restify = require('restify');
var builder = require('botbuilder');

var config = require('../config.js');
var handleMessage = require('./handle_message');

// RECAST.AI INIT
var recastClient = new recast.Client(config.recast);

// CONNECTION TO MICROSOFT BOT
var connector = new builder.ChatConnector({
  appId: config.appid,
  appPassword: config.secret
});
var bot = new builder.UniversalBot(connector);

var getUser = function getUser(address, session) {
  var user = session.userData;
  if (!user.done) {
    user.Id = address.user.id;
    user.channelID = address.channelId;
    user.name = address.user.name.split(' ')[0];
    user.intent = 'infopokemon';
    user.done = true;
    user.new = true;
  } else {
    user.new = false;
  }
  return user;
};

// MESSAGE RECEIVED
bot.dialog('/', function (session) {
  var user = getUser(session.message.address, session);
  recastClient.textRequest(session.message.text).then(function (res) {
    handleMessage(session, res, user);
  }).catch(function () {
    session.send('I need some sleep right now... Talk to me later!');
  });
});

// Setup Restify Server
var server = restify.createServer();
server.listen(config.port);
server.post('/', connector.listen());