const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Acheteur = sequelize.define('Acheteur', {
  id_acheteur: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  prenom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  telephone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  adresse: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'acheteurs',
  timestamps: true,
});

module.exports = Acheteur;
