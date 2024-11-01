const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 
const Vendeur = require('./vendeurModels');
const Gestionnaire = require('./gestionnaireModels');
const Acheteur = require('./acheteurModels');
const Jeu = require('./jeu/jeuModels');

const transactionModels = sequelize.define('Transaction', {
  id_transac: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  gestionnaire: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Gestionnaire,
      key: 'id_gestionnaire',
    },
  },
  proprietaire: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Vendeur,
      key: 'id_vendeur',
    },
  },
  acheteur: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Acheteur,
      key: 'id_acheteur',
    },
  },
  date_transac: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  remise: {
    type: DataTypes.DOUBLE,
    allowNull: true,
    validate: {
      min: 0,
    },
  },
  frais: {
    type: DataTypes.DOUBLE,
    allowNull: true,
    validate: {
      min: 0,
    },
  },
}, {
  tableName: 'transactions',
  timestamps: true,
});

transactionModels.belongsToMany(Jeu, { through: 'TransactionJeu' });

module.exports = transactionModels;
