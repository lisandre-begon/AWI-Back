const mongoose = require('mongoose');

const gestionnaireSchema = new mongoose.Schema(
  {
    pseudo: {
      type: String,
      required: true,
    },
    mot_de_passe: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Gestionnaire', gestionnaireSchema);
