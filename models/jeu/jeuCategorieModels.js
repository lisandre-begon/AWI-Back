// models/jeuCategorieModels.js

module.exports = (sequelize, DataTypes) => {
    const JeuCategorie = sequelize.define('JeuCategorie', {
        jeuId: {
          type: DataTypes.INTEGER,
          references: {
            model: 'jeux',
            key: 'jeuId'
          },
          allowNull: false,
        },
        categorieId: {
          type: DataTypes.INTEGER,
          references: {
            model: 'categories',
            key: 'categorieId'
          },
          allowNull: false,
        },
      }, {
        tableName: 'jeu_categories',
        timestamps: false,
      });
        return JeuCategorie;
    }

