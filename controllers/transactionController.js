const { getFilteredTransactions } = require('../services/transactionService');


//ATTENTION A NE PAS SUPPRIMER LE CODE CI-DESSOUS, C'EST CELUI QUE L'ON VA UTILISER QUAND ON AURA LA BASE DE DONNEE

/*async function getTransactions(req, res) {
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
*/

//ALGO QUI RENVERRA DES DONNEES FICTIVES, POUR LE LIVRABLE 2, ON LE SUPPRIMERA PAR LA SUITE, IL A LA MEME LOGIQUE QUE NOTRE ALGO FINAL

async function getTransactions(req, res) {
  try {
    // Exemple de données fictives avec des transactions contenant plusieurs jeux
    const transactions = [
      {
        id: 1,
        statut: 'vente',
        id_acheteur: 101,
        prix: 25,
        jeux: [
          {
            id_vendeur: 201,
            categorie: [
              'jeux de société', 'jeu familial'
            ],
            intitule: 'Monopoly',
            editeur: 'Hasbro',
            date_depot: '2024-10-20',
          },
          {
            id_vendeur: 202,
            categorie: [
              'jeux de stratégie',
            ],
            intitule: 'Catan',
            editeur: 'Kosmos',
            date_depot: '2024-10-22',
          },
        ],
      },
      {
        id: 2,
        statut: 'depot',
        id_acheteur: null,
        prix: 60,
        jeux: [
          {
            id_vendeur: 203,
            categorie: [
              'Jeux vidéo', 'jeu pour enfants'
            ],
            intitule: 'The Legend of Zelda',
            editeur: 'Nintendo',
            date_depot: '2024-10-23',
          },
        ],
      },
    ];

    const filteredTransactions = transactions.filter(transaction => {
      if (req.query.statut && transaction.statut !== req.query.statut) {
        return false;
      }
      if (req.query.id_acheteur && transaction.id_acheteur != req.query.id_acheteur) {
        return false;
      }
      if (req.query.id_vendeur && !transaction.jeux.some(jeu => jeu.id_vendeur == req.query.id_vendeur)) {
        return false;
      }
      matchesFilters(transaction, req.query);
    });

    if (filteredTransactions.length === 0) {
      res.status(404).json({ message: 'Aucune transaction ne correspond aux filtres fournis' });
    } else {
      res.json(filteredTransactions);
    }  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des transactions', error });
  }
}

function matchesFilters(transaction, filters) {
  return transaction.jeux.some(jeu => {
    if (filters.categorie && (!Array.isArray(jeu.categorie) || !jeu.categorie.some(cat => cat.toLowerCase() === filters.categorie.toLowerCase()))) {
      return false;
    }
    if (filters.intitule && (typeof jeu.intitule !== 'string' || jeu.intitule.toLowerCase() !== filters.intitule.toLowerCase())) {
      return false;
    }
    if (filters.editeur && (typeof jeu.editeur !== 'string' || jeu.editeur.toLowerCase() !== filters.editeur.toLowerCase())) {
      return false;
    }
    return true;
  });
}

module.exports = { getTransactions };
