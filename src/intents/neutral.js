const toText = message => { return { type: 'text', content: message } }
const u = require('../utils.js')

const getNeutral = () => {
  const answers = [
    ';)',
    ';p',
    'Lol',
    'Ahahah',
  ]
  return Promise.resolve([toText(u.random(answers))])
}
module.exports = getNeutral
