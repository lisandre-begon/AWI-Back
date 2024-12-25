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
    dateVente: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Jeu', jeuSchema);
