const { Op } = require('sequelize');
const TransactionModels = require('../models/transactionModels');
const JeuModels = require('../models/jeu/jeuModels');

async function getFilteredTransactions(filters, page = 1, sort = 'date_desc', isAdmin) {
  const whereClause = {};
  const includeClause = [];
  const itemsPerPage = 15;
  const offset = (page - 1) * itemsPerPage;

  // On filtre par depot ou vente mais je ne sais pas dans quel ordre je fais le isAdmin, ici me semble le mieux mais si tu as une meilleure idée dis le moi.
  if (filters.statut === 'depot') {
    whereClause.id_acheteur = { [Op.is]: null };
    if (!isAdmin) {
      whereClause.statut = { [Op.ne]: 'pas encore en vente' };
    }
  } else if (filters.statut === 'vente') {
    whereClause.id_acheteur = { [Op.not]: null };
  }

  // Filtrer par id_acheteur ou id_vendeur
  if (filters.id_acheteur) {
    whereClause.id_acheteur = filters.id_acheteur;
  }
  if (filters.id_vendeur) {
    whereClause.id_vendeur = filters.id_vendeur;
  }

  // Ajouter les conditions de jointure pour les attributs des jeux (ça permet de faire des associations)
  if (filters.categorie || filters.intitule || filters.editeur) {
    const jeuConditions = {};

    if (filters.categorie) {
      jeuConditions.categorie = filters.categorie;
    }
    if (filters.intitule) {
      jeuConditions.intitule = { [Op.like]: `%${filters.intitule}%` };
    }
    if (filters.editeur) {
      jeuConditions.editeur = { [Op.like]: `%${filters.editeur}%` };
    }

    includeClause.push({
      model: JeuModels,
      where: jeuConditions,
      required: false, // Permet d'inclure les transactions avec au moins un jeu correspondant, sinon on aurait eu que les transactions qui correspondent toutes aux conditions
    });
  }

  // Définir l'ordre de tri
  let order = [];
  switch (sort) {
    case 'prix_asc':
      order = [[JeuModels, 'prix', 'ASC']]; //tri de façon croissante au niveau du prix 
      break;
    case 'prix_desc':
      order = [[JeuModels, 'prix', 'DESC']]; // décroissante tu connais le sang blablabla
      break;
    case 'date_asc':
      order = [['date_depot', 'ASC']]; // la c'est dépôt
      break;
    case 'date_desc':
    default:
      order = [['date_depot', 'DESC']]; //same :E
      break;
  }

  try {
    // Va chercher les transactions qui correspondent avec toutes les conditions et avec le problème des pages pour l'affichage
    const transactions = await TransactionModels.findAll({
      where: whereClause,
      include: includeClause,
      limit: itemsPerPage,
      offset: offset,
      order: order,
    });

    if (transactions.length === 0) { //Aucun match avec les conditions, faudrait voir comment l'afficher 
      return { message: 'Aucune transaction trouvée selon les critères spécifiés.' };
    }

    return transactions;
  } catch (error) {
    console.error('Erreur lors de la récupération des transactions filtrées :', error);
    throw error;
  }
}

module.exports = { getFilteredTransactions }; //sera utilisé dans le controllers 
