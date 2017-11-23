const express = require('express');
const bodyParser = require('body-parser');
const { findPokemonByName } = require('./pokeapi.js');

const PORT = 5000;

express()
  .use(bodyParser.json())
  .post('/errors', (req, res) => (console.error(req.body), res.sendStatus(200)))
  .post('/pokemon-informations', (req, res) => {
    const memory = req.body.conversation.memory;
    const pokemon = memory.pokemon.value;

    const pokemonInfos = findPokemonByName(pokemon);

    delete memory.pokemon;

    if (!pokemonInfos) {
      return res.json({
        replies: [
          { type: 'text', content: `I don't know a pokémon called ${pokemon} :(` },
        ],
        conversation: { memory },
      });
    }

    res.json({
      replies: [
        { type: 'text', content: `🔎${pokemonInfos.name} infos` },
        { type: 'text', content: `Type(s): ${pokemonInfos.types.join(' and ')}` },
        { type: 'text', content: pokemonInfos.description },
        { type: 'picture', content: pokemonInfos.imageUrl },
      ],
      conversation: { memory },
    });
  })
  .listen(PORT, () => console.log(`App is listening on port ${PORT}`));
