const { getFilteredTransactions, createDepot } = require('../services/transactionService');

//ATTENTION A NE PAS SUPPRIMER LE CODE CI-DESSOUS, C'EST CELUI QUE L'ON VA UTILISER QUAND ON AURA LA BASE DE DONNEE

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
      sort: req.query.sort || 'date_desc', // Option de tri
    };

    const isAdmin = 'true'
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

async function getTransactionById(id) {
  try {
    const response = await apiClient.get(`/transactions/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération de la transaction avec l'ID ${id}:`, error);
    return null;
  }
}

async function createTransaction(req, res) {
  try {
    const champs = req.body;
    if (champs.id_vendeur) {
      if (champs.id_acheteur) {
        return res.status(400).json({ message: 'Un dépôt ne peut pas avoir d\'acheteur.' });
      }
      // Appeler la fonction asynchrone createDepot
      const depotResult = await createDepot(req, res);
      return res.status(201).json(depotResult);
    } else if (champs.id_acheteur) {
      if (!champs.id_vendeur) {
        return res.status(400).json({ message: 'Une vente ne possède pas de propriétaire.' });
      }
      // Appeler la fonction asynchrone createVente
      const venteResult = await createVente(req, res);
      return res.status(201).json(venteResult);
    } else {
      return res.status(400).json({ message: 'Le vendeur ou l\'acheteur doit être spécifié.' });
    }
  } catch (error) {
    console.error('Erreur lors de la création de la transaction:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
}



module.exports = { getTransactions, createTransaction};
