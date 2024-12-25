const mongoose = require('mongoose');

const categorieSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
});

const Categorie = mongoose.model('Categorie', categorieSchema);

module.exports = Categorie;
