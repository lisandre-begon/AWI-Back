// models/categorieModel.js
module.exports = (sequelize, DataTypes) => {
  const Categorie = sequelize.define('Categorie', {
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
    tableName: 'Categories',
    timestamps: false,
  });
/*
  Categorie.associate = (models) => {
    // Relation N-N avec Jeu
    Categorie.belongsToMany(models.Jeu, {
      through: 'JeuCategorie',
      foreignKey: 'categorieId',
      otherKey: 'jeuId',
    });
  };
*/
  return Categorie;
};
