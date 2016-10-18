'use strict';

var u = {
  toText: function toText(message) {
    return { type: 'text', content: message };
  },
  toButtons: function toButtons(title, buttons) {
    return { type: 'buttons', content: buttons, title: title };
  },
  toButton: function toButton(title, value) {
    return { title: title, value: value };
  },
  isDuplicate: function isDuplicate(type, array) {
    var seen = false;
    var res = false;
    array.forEach(function (elem) {
      if (elem === type) {
        if (seen === false) {
          seen = true;
        } else {
          res = true;
        }
      }
    });
    return res;
  },
  random: function random(array) {
    return array[Math.floor(Math.random() * array.length)];
  },
  delDuplicates: function delDuplicates(array) {
    var done = [];
    array.forEach(function (elem) {
      if (done.indexOf(elem) === -1) {
        done.push(elem);
      }
    });
    return done;
  },
  cleanText: function cleanText(text) {
    return text.replace(/[\.;,:\?!]/gi, ' ');
  }
};

module.exports = u;