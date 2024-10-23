const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Gestionnaire = sequelize.define('Gestionnaire', {
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

module.exports = Gestionnaire;
