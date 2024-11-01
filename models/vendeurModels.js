const { DataTypes } = require('sequelize');
const sequelize = require('../config/database.js');

const vendeurModels = sequelize.define('Vendeur', {
  id_vendeur: {
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
  solde: {
    type: DataTypes.DOUBLE,
    defaultValue: 0.0,
    allowNull: false,
  },
}, {
  tableName: 'vendeurs',
  timestamps: true,
});

module.exports = vendeurModels;
