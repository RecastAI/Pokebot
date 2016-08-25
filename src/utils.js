const u = {
  toText: message => { return { type: 'text', content: message } },
  toButtons: (title, buttons) => { return { type: 'buttons', content: buttons, title } },
  toButton: (title, value) => { return { title, value } },
  isDuplicate: (type, array) => {
    let seen = false
    let res = false
    array.forEach(elem => {
      if (elem === type) {
        if (seen === false) {
          seen = true
        } else { res = true }
      }
    })
    return res
  },
  random: array => { return array[Math.floor(Math.random() * array.length)] },
  delDuplicates: (array) => {
    const done = []
    array.forEach(elem => {
      if (done.indexOf(elem) === -1) { done.push(elem) }
    })
    return done
  },
  cleanText: (text) => {
    return (text.replace(/[\.;,:\?!]/gi, ' '))
  },
}

module.exports = u
