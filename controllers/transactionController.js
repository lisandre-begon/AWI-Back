/*const { getFilteredTransactions, createDepot } = require('../services/transactionService');

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
*/

const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb+srv://lisandrebegon1:czbssegw5de6kicv@awidatabase.1z4go.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

class TransactionController {
  static async createTransactions(req, res) {
    try {
      await client.connect();
      const db = client.db('awidatabase');
      const gestionnaireCollection = db.collection('gestionnaires');
      const transactionCollection = db.collection('transactions');
      const jeuxCollection = db.collection("jeux");
      const vendeursCollection = db.collection("vendeurs");

      const { statut, gestionnaire, proprietaire, acheteur, remise, prix_total, frais, jeux } = req.body;

      if (!statut || !['pas disponible', 'disponible', 'vendu'].includes(statut)) {
        return res.status(400).json({ message: 'Statut invalide ou manquant.' });
      }

      if (!gestionnaire) {
        return res.status(400).json({ message: 'Un gestionnaire est requis.' });
      }

      if (!prix_total || prix_total <= 0) {
          return res.status(400).json({ message: 'Un prix total valide est requis.' });
      }

      if (!frais || frais < 0) {
          return res.status(400).json({ message: 'Des frais valides sont requis.' });
      }

      if (!proprietaire && !acheteur) {
          return res.status(400).json({ message: 'Un propriétaire ou un acheteur est requis.' });
      }

      if (proprietaire && acheteur) {
          return res.status(400).json({ message: 'Un propriétaire ou un acheteur est requis, pas les deux.' });
      }

      if (proprietaire) {
        const proprietaireExists = await vendeursCollection.findOne({ _id: ObjectId(proprietaire) });
        if (!proprietaireExists) {
            return res.status(404).json({ message: 'Le propriétaire spécifié n\'existe pas.' });
        }
      } else if (acheteur) {
        const acheteurExists = await acheteursCollection.findOne({ _id: ObjectId(acheteur) });
        if (!acheteurExists) {
            return res.status(404).json({ message: 'L\'acheteur spécifié n\'existe pas.' });
        }
      }


      const gestionnaireExists = await gestionnaireCollection.findOne({ _id: ObjectId(gestionnaire) });
      if (!gestionnaireExists) {
          return res.status(404).json({ message: 'Le gestionnaire spécifié n\'existe pas.' });
      }

      // Validate jeux
      if (jeux && jeux.length > 0) {
          const invalidJeux = [];
          for (const jeuId of jeux) {
              const jeuExists = await jeuxCollection.findOne({ _id: ObjectId(jeuId) });
              if (!jeuExists) invalidJeux.push(jeuId);
          }

          if (invalidJeux.length > 0) {
              return res.status(404).json({
                  message: `Les jeux suivants n\'existent pas : ${invalidJeux.join(', ')}`,
              });
          }

          //Check if all games are not already in a transaction
          const alreadyInTransaction = [];
          for (const jeuId of jeux) {
              const jeu = await jeuxCollection.findOne({ _id: ObjectId(jeuId) });
              if (jeu.statut != 'disponible') alreadyInTransaction.push(jeuId);
          }

          if (alreadyInTransaction.length > 0) {
              return res.status(400).json({
                  message: `Les jeux suivants sont déjà dans une transaction : ${alreadyInTransaction.join(', ')}`,
              });
          }
          
          //Check if all games have the proprietaire as owner
          if (proprietaire) {
              const proprietaireExists = await vendeursCollection.findOne({ _id: ObjectId(proprietaire) });
              if (!proprietaireExists) {
                  return res.status(404).json({ message: 'Le propriétaire spécifié n\'existe pas.' });
              }

              const invalidJeux = [];
              for (const jeuId of jeux) {
                  const jeu = await jeuxCollection.findOne({ _id: ObjectId(jeuId) });
                  if (jeu.proprietaire != proprietaire) invalidJeux.push(jeuId);
              }

              if (invalidJeux.length > 0) {
                  return res.status(400).json({
                      message: `Les jeux suivants n\'appartiennent pas au propriétaire spécifié : ${invalidJeux.join(', ')}`,
                  });
              }
          }
      } else {
          return res.status(400).json({ message: 'Au moins un jeu est requis.' });
      }

      const newTransaction = {
          statut,
          gestionnaire: ObjectId(gestionnaire),
          proprietaire: proprietaire ? ObjectId(proprietaire) : null,
          acheteur: acheteur ? ObjectId(acheteur) : null,
          date_transaction: new Date(),
          remise: remise || 0,
          prix_total,
          frais,
          jeux: jeux.map(jeuId => ObjectId(jeuId)),
      };

      await transactionCollection.insertOne(newTransaction);
      res.status(201).json({ message: 'Transaction créée avec succès.'});
    }
    catch (error) {
      console.error('Erreur lors de la récupération des transactions :', error);
      res.status(500).json({ message: 'Erreur serveur lors de la récupération des transactions.' });
    }
  }
}

module.exports = TransactionController;
