const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const gestionnaire = sequelize.define('gestionnaire', {
  id_gestionnaire: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  mot_de_passe: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'gestionnaires',
  timestamps: true,
});

module.exports = gestionnaire;
