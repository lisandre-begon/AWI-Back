const { getFilteredTransactions } = require('../services/transactionService');

async function getTransactions(req, res) {
  try {
    const filters = {
      statut: req.query.statut || null, // 'depot' ou 'vente' ou 'pas encore en vente'
      id_acheteur: req.query.id_acheteur || null,
      id_vendeur: req.query.id_vendeur || null,
      categorie: req.query.categorie || null,
      intitule: req.query.intitule || null,
      editeur: req.query.editeur || null,
      page: req.query.page || 1,
      limit: 15,
      sort: req.query.sort || 'date_vente_desc', // Option de tri
    };

    const isAdmin = 'false'
    const transactions = await getFilteredTransactions(filters, filters.page, filters.sort, isAdmin);

    if (transactions.length === 0) {
      return res.status(404).json({ message: 'Aucune transaction correspondant aux critères trouvée.' });
    }

    res.status(200).json(transactions);
  } catch (error) {
    console.error('Erreur lors de la récupération des transactions :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des transactions.' });
  }
}

module.exports = { getTransactions };
