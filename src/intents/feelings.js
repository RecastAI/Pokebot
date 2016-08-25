const toText = message => { return { type: 'text', content: message } }
const u = require('../utils.js')

const getFeelings = () => {
  const answers = [
    'I\'m doing well thanks!',
    'I had a nightmare yesterday about being a bot. Terrifying. Hopefully it was just a bad dream!',
    'Super good, as usual! You know how glad I am when I see you typing :cat:',
    'Someone just spoiled the last episode of Game of thrones, so I\'m kinda bumped...',
    'Good, I can\'t wait to see the next Pokemon games!',
    'Not bad. Just dreaming of holidays on the beach.',
    'I\'m alright. Ready to become a pokeMaster?',
    'I\'m feeling excited! I got a lot of things to teach you today.',
  ]
  return Promise.resolve([toText(u.random(answers))])
}

module.exports = getFeelings
