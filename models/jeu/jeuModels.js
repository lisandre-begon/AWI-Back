const mongoose = require('mongoose');

const jeuSchema = new mongoose.Schema(
  {
    etiquette: {
      type: Number,
      alias : '_id'
    },
    proprietaire: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendeur',
      required: true,
    },
    statut: {
      type: String,
      enum: ["pas disponible", "disponible", "vendu"],
      default: 'disponible',
    },
    typeJeuId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TypeJeu',
      required: true,
    },
    quantites: {
      type: Number,
      required: true,
      default: 1,
    },
    prix: {
      type: Number,
      required: true,
    },
    dateDepot: {
      type: Date,
      alias: 'createdAt',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Jeu', jeuSchema);
