// indexModels.js
const sequelize = require('../config/database');
const Vendeur = require('./VendeurModels');
const Gestionnaire = require('./GestionnaireModels');
const Acheteur = require('./AcheteurModels');
const Transaction = require('./TransactionModels');
const Jeu = require('./jeu/JeuModels'); // Met à jour le chemin vers JeuModels
const Categorie = require('./jeu/CategorieModels'); // Met à jour le chemin vers CategorieModels

// Associations
Jeu.belongsToMany(Categorie, { through: 'JeuCategorie' });
Categorie.belongsToMany(Jeu, { through: 'JeuCategorie' });

Transaction.belongsTo(Vendeur, { foreignKey: 'proprietaire' });
Transaction.belongsTo(Gestionnaire, { foreignKey: 'gestionnaire' });
Transaction.belongsTo(Acheteur, { foreignKey: 'acheteur', allowNull: true });
Vendeur.hasMany(Transaction, { foreignKey: 'proprietaire' });

// Synchronisation des modèles
sequelize.sync()
  .then(() => console.log('Tables synchronisées'))
  .catch(error => console.log('Erreur lors de la synchronisation', error));

module.exports = {
  Vendeur,
  Gestionnaire,
  Acheteur,
  Transaction,
  Jeu,
  Categorie,
};
