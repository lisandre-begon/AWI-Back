const mongoose = require('mongoose');

const jeuSchema = new mongoose.Schema({
  etiquette: {
    type: Number,
    required: true,
    unique: true,
  },
  vendeurId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendeur',
    required: true,
  },
  intitule: {
    type: String,
    required: true,
  },
  editeur: {
    type: String,
    required: true,
  },
  prix: {
    type: Number,
    required: true,
  },
  dateDepot: {
    type: Date,
    required: true,
  },
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Categorie',
    },
  ],
});

module.exports = mongoose.model('Jeu', jeuSchema);
