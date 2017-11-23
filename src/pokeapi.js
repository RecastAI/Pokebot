const path = require('path');
const db = require(path.join(__dirname, '../pokedex.json'));

function findPokemonByName(name) {
  const data = db.find(p => p.name.toLowerCase() === name.toLowerCase());
  if (!data) {
    return null;
  }

  return {
    name: data.name,
    types: data.types,
    description: data.description,
    imageUrl: data.image,
  };
};

module.exports = {
  findPokemonByName,
};
