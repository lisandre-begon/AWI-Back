const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    statut: {
      type: String,
      enum: ["depot", "vente"],
      required: true,
    },
    gestionnaire: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gestionnaire',
      required: true,
    },
    proprietaire: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendeur',
    },
    acheteur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Acheteur',
    },
    date_transaction: {
      type: Date,
      required: true,
    },
    remise: {
      type: Number,
      default: 0,
    },
    prix_total: {
      type: Number,
      required: true,
    },
    frais: {
      type: Number,
      required: true,
    },
    jeux: [
      {
        jeuId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Jeu',
          required: true,
        },
        quantite: {
          type: Number,
          required: true,
        },
        prix_unitaire: {
          type: Number,
          required: true,
        },
      }
      
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Transaction', transactionSchema);
