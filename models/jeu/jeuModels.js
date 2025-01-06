const mongoose = require('mongoose');

const jeuSchema = new mongoose.Schema(
  {
    etiquette: {
      type: Number,
      alias : '_id'
    },
    vendeurId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendeur',
      required: true,
    },
    acheteurId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Acheteur',
    },
    statut: {
      type: String,
      enum: ['pas disponible', "disponible", 'vendu'],
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
    }
    prix: {
      type: Number,
      required: true,
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categorie',
        required: true,
      },
    ],
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
