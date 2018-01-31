const express = require('express');
const bodyParser = require('body-parser');
const db = require('./pokedex.json');

const app = express();
app.use(bodyParser.json());

function findPokemonByName(name) {
  const data = db.find(p => p.name.toLowerCase() === name.toLowerCase());
  if (!data) {
    return null;
  }
  return data;
};

function getPokemonInformations(req, res) {
  const pokemon = req.body.conversation.memory.pokemon;
  const pokemonInfos = findPokemonByName(pokemon.value);

  if (!pokemonInfos) {
    res.json({
      replies: [
        { type: 'text', content: `I don't know a Pokémon called ${pokemon} :(` },
      ],
    });
  } else {
    res.json({
      replies: [
        { type: 'text', content: `🔎${pokemonInfos.name} infos` },
        { type: 'text', content: `Type(s): ${pokemonInfos.types.join(' and ')}` },
        { type: 'text', content: pokemonInfos.description },
        { type: 'picture', content: pokemonInfos.image },
      ],
    });
  }
}

function formatEvolutionString(evolution) {
  let base = `🔸 ${evolution.name}`;
  if (evolution.trigger === 'leveling') {
    base += ` -> lvl ${evolution.trigger_lvl}`;
  }
  if (evolution.trigger === 'item') {
    base += ` -> ${evolution.trigger_item}`;
  }
  return base;
}

function getPokemonEvolutions(req, res) {
  const pokemon = req.body.conversation.memory.pokemon;
  const pokemonInfos = findPokemonByName(pokemon.value);

  if (!pokemonInfos) {
    res.json({
      replies: [
        { type: 'text', content: `I don't know a Pokémon called ${pokemon} :(` },
      ],
    });
  } else if (pokemonInfos.evolutions.length === 1) {
    res.json({
      replies: [{ type: 'text', content: `${pokemonInfos.name} has no evolutions.` }],
    });
  } else {
    res.json({
      replies: [
        { type: 'text', content: `🔎${pokemonInfos.name} family` },
        {
          type: 'text',
          content: pokemonInfos.evolutions.map(formatEvolutionString).join('\n'),
        },
        {
          type: 'card',
          content: {
            title: 'See more about them',
            buttons: pokemonInfos.evolutions
              .filter(p => p.id !== pokemonInfos.id) // Remove initial pokemon from list
              .map(p => ({
                type: 'postback',
                title: p.name,
                value: `Tell me more about ${p.name}`,
              })),
          },
        },
      ],
    });
  }
}

// Load routes
app.post('/pokemon-informations', getPokemonInformations);
app.post('/pokemon-evolutions', getPokemonEvolutions);
app.post('/errors', function (req, res) {
  console.error(req.body);
  res.sendStatus(200);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`App is listening on port ${PORT}`));
