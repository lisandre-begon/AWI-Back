const mongoose = require('mongoose');

const acheteurSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
  },
  prenom: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  adresse: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Acheteur', acheteurSchema);
