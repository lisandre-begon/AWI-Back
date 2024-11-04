const gestionnaire = require('../models/gestionnaireModels');
const { getFilteredTransactions } = require('../services/transactionService');
const transaction = require('../models/transactionModels');
const { jeuxPrefaits, vendeurPrefaits, gestionnairePrefaits, transactionsPrefaites } = require('../config/donneeFictives');


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

    const filteredTransactions = transactionsPrefaites.filter(transaction => {
      if (req.query.statut && transactionsPrefaites.statut !== req.query.statut) {
        return false;
      }
      if (req.query.id_acheteur && transactionsPrefaites.id_acheteur != req.query.id_acheteur) {
        return false;
      }
      if (req.query.id_vendeur && !transactionsPrefaites.jeux.some(jeu => jeu.id_vendeur == req.query.id_vendeur)) {
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



async function createTransaction(req, res) {
  // Liste des champs autorisés pour la création d'une transaction
  const allowedFields = ['id_jeu', 'id_vendeur', 'id_gestionnaire'];

  // Récupérer les champs du corps de la requête
  const bodyFields = Object.keys(req.body);

  // Vérifier si tous les champs dans req.body sont autorisés
  const hasInvalidFields = bodyFields.some(field => !allowedFields.includes(field));

  if (hasInvalidFields) {
      return res.status(400).json({ error: 'Le corps de la requête contient des champs non autorisés.' });
  }

  const { id_jeu, id_vendeur, id_gestionnaire } = req.body;

  try {

    if (!id_jeu || !Array.isArray(id_jeu) || id_jeu.length === 0) {
      return res.status(400).json({ error: 'Le(s) id_jeu est/sont requis et doit/doivent être un tableau non vide.' });
    }
    if (!id_vendeur) {
      return res.status(400).json({ error: 'Le id_vendeur est requis.' });
    }
    if (!id_gestionnaire) {
      return res.status(400).json({ error: 'Le id_gestionnaire est requis.' });
    }

    // Données fictives pour les jeux et les vendeurs
    const jeux = id_jeu.map(id_jeu => jeuxPrefaits.find(jeu => jeu.id === id_jeu));
    const vendeur = vendeurPrefaits.find(vendeur => vendeur.id === id_vendeur);
    const gestionnaire = gestionnairePrefaits.find(gestionnaire => gestionnaire.id === id_gestionnaire);

    /*
      // Vérifier si le jeu et le vendeur existent (ajoutez les vérifications nécessaires si requis)
      const jeu = await Jeu.findByPk(id_jeu);
      const vendeur = await Vendeur.findByPk(id_vendeur);
    */

      if (!jeux || jeux.length === 0) {
          return res.status(404).json({ error: 'Le(s) jeu(x) est/sont introuvable(s)' });
      }else {
        const invalidJeux = jeux.some(jeu => jeu.id_vendeur !== vendeur.id);
        if (invalidJeux) {
          return res.status(400).json({ error: 'Un ou plusieurs jeux ne correspondent pas au vendeur spécifié.' });
        }
      }

      if (!vendeur) {
          return res.status(404).json({ error: 'Le vendeur spécifié est introuvable.' });
      }

      if (!gestionnaire)  {
        return res.status(404).json({ error: 'Vous n\'avez oas le droit de créer une transaction.' });
      }

      res.status(201).json({ message: 'Dépôt créé avec succès.', jeux, proprietaire : vendeur, gestionnaire, date_transaction : new Date(), });

      /*
      // Créer la transaction (dépôt)
      const transaction = await transaction.create({
          id_jeu,
          id_vendeur,
          id_gestionnaire,
          id_acheteur: null, // Pas d'acheteur pour un dépôt
          dateDepot: new Date() // Date du jour
      });
      

      res.status(201).json({ message: 'Transaction créée avec succès.', transaction });
      */
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la création de la transaction.' });
  }
}

async function createVente(req, res) {
  // Liste des champs autorisés pour la création d'une transaction
  const allowedFields = ['id_jeu', 'id_vendeur', 'id_gestionnaire', 'id_acheteur', 'prix'];

  // Récupérer les champs du corps de la requête
  const bodyFields = Object.keys(req.body);

  // Vérifier si tous les champs dans req.body sont autorisés
  const hasInvalidFields = bodyFields.some(field => !allowedFields.includes(field));

  if (hasInvalidFields) {
      return res.status(400).json({ error: 'Le corps de la requête contient des champs non autorisés.' });
  }

  const { id_jeu, id_vendeur, id_gestionnaire } = req.body;

  try {

    if (!id_jeu || !Array.isArray(id_jeu) || id_jeu.length === 0) {
      return res.status(400).json({ error: 'Le(s) id_jeu est/sont requis et doit/doivent être un tableau non vide.' });
    }
    if (!id_vendeur) {
      return res.status(400).json({ error: 'Le id_vendeur est requis.' });
    }
    if (!id_gestionnaire) {
      return res.status(400).json({ error: 'Le id_gestionnaire est requis.' });
    }

    // Données fictives pour les jeux et les vendeurs
    const jeux = id_jeu.map(id_jeu => jeuxPrefaits.find(jeu => jeu.id === id_jeu));
    const vendeur = vendeurPrefaits.find(vendeur => vendeur.id === id_vendeur);
    const gestionnaire = gestionnairePrefaits.find(gestionnaire => gestionnaire.id === id_gestionnaire);

    /*
      // Vérifier si le jeu et le vendeur existent (ajoutez les vérifications nécessaires si requis)
      const jeu = await Jeu.findByPk(id_jeu);
      const vendeur = await Vendeur.findByPk(id_vendeur);
    */

      if (!jeux || jeux.length === 0) {
          return res.status(404).json({ error: 'Le(s) jeu(x) est/sont introuvable(s)' });
      }else {
        const invalidJeux = jeux.some(jeu => jeu.id_vendeur !== vendeur.id);
        if (invalidJeux) {
          return res.status(400).json({ error: 'Un ou plusieurs jeux ne correspondent pas au vendeur spécifié.' });
        }
      }

      if (!vendeur) {
          return res.status(404).json({ error: 'Le vendeur spécifié est introuvable.' });
      }

      if (!gestionnaire)  {
        return res.status(404).json({ error: 'Vous n\'avez oas le droit de créer une transaction.' });
      }

      res.status(201).json({ message: 'Dépôt créé avec succès.', jeux, proprietaire : vendeur, gestionnaire, date_transaction : new Date(), });

      /*
      // Créer la transaction (dépôt)
      const transaction = await transaction.create({
          id_jeu,
          id_vendeur,
          id_gestionnaire,
          id_acheteur: null, // Pas d'acheteur pour un dépôt
          dateDepot: new Date() // Date du jour
      });
      

      res.status(201).json({ message: 'Transaction créée avec succès.', transaction });
      */
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la création de la transaction.' });
  }
}


module.exports = { getTransactions, createTransaction };
