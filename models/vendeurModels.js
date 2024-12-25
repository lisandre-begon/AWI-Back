const mongoose = require('mongoose');

const vendeurSchema = new mongoose.Schema({
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
  telephone: {
    type: String,
    required: true,
  },
  solde: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('Vendeur', vendeurSchema);
