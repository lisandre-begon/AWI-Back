const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database'); // Assurez-vous que ce chemin est correct

const categorieModels = sequelize.define('JeuCategorie', {
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

module.exports = categorieModels;
