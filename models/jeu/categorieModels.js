const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CategorieModels = sequelize.define('Categorie', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'categories',
  timestamps: true,
});

module.exports = CategorieModels;
