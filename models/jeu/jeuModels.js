const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const CategorieModels = require('./CategorieModels');

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
}, {
  tableName: 'jeux',
  timestamps: true,
});

JeuModels.belongsToMany(CategorieModels, { through: 'JeuCategorie' });
CategorieModels.belongsToMany(JeuModels, { through: 'JeuCategorie' });

module.exports = JeuModels;
