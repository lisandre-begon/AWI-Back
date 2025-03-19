const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  dateDebut: {
    type: Date,
    required: true,
    unique: true,
  },
  dateFin: {
    type: Date,
    required: true,
  },
  fraisDepot: {
    type: String,
    required: true
  },
  statutSession: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Session', sessionSchema);