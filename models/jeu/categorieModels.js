const mongoose = require('mongoose');

const categorieSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Prevent duplicate category names
    trim: true,   // Removes extra spaces
  },
});

const Categorie = mongoose.model('Categorie', categorieSchema);

module.exports = Categorie;
