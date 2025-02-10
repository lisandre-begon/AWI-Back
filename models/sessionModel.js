const mongoose = require('mongoose');

const session = new mongoose.Schema({
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
    type : Number,
    required : true
  }
  statutSession: {
    type: String,
    required : true
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('session', sessinShema);