const mongoose = require('mongoose');

const typeJeuSchema = new mongoose.Schema({
  intitule: {
    type: String,
    required: true,
    unique: true,
  },
  editeur: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('TypeJeu', typeJeuSchema);