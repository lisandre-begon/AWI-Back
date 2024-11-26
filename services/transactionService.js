const { Op } = require('sequelize');
const TransactionModels = require('../models/transactionModels');
const JeuModels = require('../models/jeu/jeuModels');
const jeuxPrefaits = require('../config/donneeFictives');

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

    includeClause.push({  //On utilise includeClause car c'est des relations entre les tables, il ne s'agit pas d'un paramètre unique 
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
      return res.status(400)({ message: 'Aucune transaction trouvée selon les critères spécifiés.' });
    }

    return transactions;
  } catch (error) {
    console.error('Erreur lors de la récupération des transactions filtrées :', error);
    throw error;
  }
}

async function createDepot(champs, res) {
  if (!champs || !champs.body) {
    return res.status(400).json({ error: 'Le corps de la requête est manquant ou invalide.' });
  }

  const allowedFields = ['jeux', 'id_vendeur', 'id_gestionnaire', 'prix_total', 'remise'];
  const bodyFields = Object.keys(champs.body);
  
  // Vérification des champs non autorisés
  if (bodyFields.some(field => !allowedFields.includes(field))) {
    return res.status(400).json({ error: 'Le corps de la requête contient des champs non autorisés.' });
  }

  const { jeux, id_vendeur, id_gestionnaire, prix_total, remise } = champs.body;

  try {
    if (!jeux || !Array.isArray(jeux) || jeux.length === 0) {
      return res.status(400).json({ error: 'Le(s) jeu(x) est/sont requis et doit/doivent être un tableau non vide.' });
    }
    if (!id_vendeur) {
      return res.status(400).json({ error: 'Le id_vendeur est requis.' });
    }
    if (!id_gestionnaire) {
      return res.status(400).json({ error: 'Le id_gestionnaire est requis.' });
    }
    if (typeof prix_total !== 'number' || prix_total <= 0) {
      return res.status(400).json({ error: 'Le prix total doit être un nombre positif.' });
    }

    const remiseValide = remise ? (typeof remise === 'number' && remise >= 0) : 0;

    // Vérifications de la base de données ou données fictives
    const Jeux = jeux.map(jeu => jeuxPrefaits.find(j => j.id === jeu.id));
    const vendeur = vendeurPrefaits.find(v => v.id === id_vendeur);
    const gestionnaire = gestionnairePrefaits.find(g => g.id === id_gestionnaire);

    if (!Jeux || Jeux.includes(undefined)) {
      return res.status(404).json({ error: 'Un ou plusieurs jeux spécifiés sont introuvables.' });
    }
    if (!vendeur) {
      return res.status(404).json({ error: 'Le vendeur spécifié est introuvable.' });
    }
    if (!gestionnaire) {
      return res.status(403).json({ error: 'Vous n\'avez pas le droit de créer une transaction.' });
    }

    const invalidJeux = Jeux.some(jeu => jeu.id_vendeur !== vendeur.id);
    if (invalidJeux) {
      return res.status(400).json({ error: 'Un ou plusieurs jeux ne correspondent pas au vendeur spécifié.' });
    }

    res.status(201).json({
      message: 'Dépôt créé avec succès.',
      gestionnaire,
      proprietaire: vendeur,
      jeux: Jeux,
      date_transaction: new Date(),
      frais: prix_total,
      remise: remiseValide
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la création du dépôt.' });
  }
}


async function createVente(champs, res) {
  if (!champs || !champs.body) {
    return res.status(400).json({ error: 'Le corps de la requête est manquant ou invalide.' });
  }

  // Liste des champs autorisés pour la création d'une transaction
  const allowedFields = ['jeux', 'id_gestionnaire', 'id_acheteur', 'prix_total', 'remise'];

  // Récupérer les champs du corps de la requête
  const bodyFields = Object.keys(champs.body);

  // Vérifier si tous les champs dans champs.body sont autorisés
  const hasInvalidFields = bodyFields.some(field => !allowedFields.includes(field));

  if (hasInvalidFields) {
      return res.status(400).json({ error: 'Le corps de la requête contient des champs non autorisés.',});
  }

  const { id_jeu, id_acheteur, id_gestionnaire, prix_total, remise } = champs.body;

  try {

    if (!id_jeu || !Array.isArray(id_jeu) || id_jeu.length === 0) {
      return res.status(400).json({ error: 'Le(s) id_jeu est/sont requis et doit/doivent être un tableau non vide.' });
    }
    if (!id_acheteur) {
      return res.status(400).json({ error: 'Le id_acheteur est requis.' });
    }
    if (!id_gestionnaire) {
      return res.status(400).json({ error: 'Le id_gestionnaire est requis.' });
    }
    if (!prix_total) {
      return res.status(400).json({ error: 'Le prix total est requis.' });
    }
    if (remise < 0) {
      return res.status(400).json({ error: 'La remise doit être un nombre positif.' });
    }
    // Données fictives pour les jeux et les vendeurs
    const jeux = id_jeu.map(jeu => jeuxPrefaits.find(jeu => jeu.id === id_jeu));
    const acheteur = acheteurPrefaits.find(acheteur => acheteur.id === id_acheteur);
    const gestionnaire = gestionnairePrefaits.find(gestionnaire => gestionnaire.id === id_gestionnaire);

    /*
      // Vérifier si le jeu et le vendeur existent (ajoutez les vérifications nécessaires si requis)
      const jeu = await Jeu.findByPk(id_jeu);
      const vendeur = await Vendeur.findByPk(id_vendeur);
    */


      if (!acheteur) {
          return res.status(404).json({ error: 'L\'acheteur spécifié est introuvable.' });
      }

      if (!gestionnaire)  {
        return res.status(404).json({ error: 'Vous n\'avez oas le droit de créer une transaction.' });
      }

      if (!jeux || jeux.length === 0) {
          return res.status(404).json({ error: 'Le(s) jeu(x) est/sont introuvable(s)' });
      }

      res.status(201).json({ message: 'Vente créée avec succès.', gestionnaire, acheteur : acheteur, jeux, date_transaction : new Date(), frais : prix_total, remise});

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

module.exports = { getFilteredTransactions, createDepot, createVente }; //sera utilisé dans le controllers 
