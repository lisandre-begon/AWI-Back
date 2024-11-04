const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const CategorieModels = require('./categorieModels');

const JeuModels = sequelize.define('Jeu', {
  etiquette: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  intitule: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  editeur: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  prix: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    validate: {
      isFloat: true,
      min: 0,
    },
  },
  statut : {
    type: DataTypes.ENUM('en vente', 'pas encore en vente', 'vendu'),
    allowNull: false,
    defaultValue: 'en vente',
  },
  dateDepot: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  dateVente: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
  },
}, {
  tableName: 'jeux',
  timestamps: true,
});

/*
JeuModels.associate = (models) => {
  // Relation N-N avec Categorie
  JeuModels.belongsToMany(models.Categorie, {
    through: 'JeuCategorie',
    foreignKey: 'jeuId',
    otherKey: 'categorieId',
  });

  // Relation N-N avec Transaction
  JeuModels.belongsToMany(models.Transaction, {
    through: 'TransactionJeu',
    foreignKey: 'jeuId',
    otherKey: 'transactionId',
  });
};
*/ 
return JeuModels;
