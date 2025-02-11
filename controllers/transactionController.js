const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb+srv://lisandrebegon1:czbssegw5de6kicv@awidatabase.1z4go.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);
const connectToDatabase = require('../config/database');

class TransactionController {
  static async createTransaction(req, res) {
    try {
      const db = await connectToDatabase();
      const gestionnaireCollection = db.collection('gestionnaires');
      const transactionCollection = db.collection('transactions');
      const jeuxCollection = db.collection("jeux");
      const vendeursCollection = db.collection("vendeurs");
      const acheteursCollection = db.collection("acheteurs");

      const { gestionnaire, proprietaire, acheteur, prix_total, frais, jeux, remise } = req.body;

      // Validation des entrées
      if (!gestionnaire || !ObjectId.isValid(gestionnaire)) {
        return res.status(400).json({ message: 'Un ID de gestionnaire valide est requis.' });
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

      const gestionnaireExists = await gestionnaireCollection.findOne({ _id: new ObjectId(gestionnaire) });
      if (!gestionnaireExists) {
        return res.status(404).json({ message: 'Le gestionnaire spécifié n\'existe pas.' });
      }

      if (remise < 0 || remise > frais) {
        return res.status(400).json({ message: 'La remise doit être comprise entre 0 et les frais.' });
      }

      // Dépôt
      if (proprietaire) {
        if (!ObjectId.isValid(proprietaire)) {
          return res.status(400).json({ message: 'Un ID de propriétaire valide est requis.' });
        }

        const proprietaireExists = await vendeursCollection.findOne({ _id: new ObjectId(proprietaire) });
        if (!proprietaireExists) {
          return res.status(404).json({ message: 'Le propriétaire spécifié n\'existe pas.' });
        }

        const invalidJeux = [];
        for (const jeu of jeux) {
          if (!ObjectId.isValid(jeu.jeuId)) {
            invalidJeux.push(jeu.jeuId);
            continue;
          }

          const jeuData = await jeuxCollection.findOne({ _id: new ObjectId(jeu.jeuId) });
          if (!jeuData) {
            invalidJeux.push(jeu.jeuId);
            continue;
          }

          if (!jeuData.proprietaire.equals(new ObjectId(proprietaire))) {
            invalidJeux.push(jeu.jeuId);
          }

          // Vérifiez les quantités impliquées dans des transactions existantes
          const transactions = await transactionCollection.find({ "jeux.jeuId": new ObjectId(jeu.jeuId) }).toArray();
          const totalQuantiteTransactions = transactions.reduce((sum, transaction) => {
            const jeuTransaction = transaction.jeux.find(j => j.jeuId.toString() === jeu.jeuId);
            return sum + (jeuTransaction ? jeuTransaction.quantite : 0);
          }, 0);

          const nouvelleQuantite = totalQuantiteTransactions + jeu.quantite;
          if (nouvelleQuantite > jeuData.quantites) {
            return res.status(400).json({
              message: `Quantité pour le jeu ${jeuData._id} dépasse la quantité disponible (${jeuData.quantites}).`,
            });
          }
        }

        if (invalidJeux.length > 0) {
          return res.status(400).json({
            message: `Les jeux suivants n'appartiennent pas au propriétaire spécifié ou sont invalides : ${invalidJeux.join(', ')}`,
          });
        }

        //On met à jour le solde du propriétaire (solde = solde - frais)
        await vendeursCollection.updateOne({ _id: new ObjectId(proprietaire) }, { $inc: { solde: -frais } });


        // Créez la transaction pour le dépôt
        const newDepot = {
          statut: 'depot',
          gestionnaire: new ObjectId(gestionnaire),
          proprietaire: new ObjectId(proprietaire),
          date_transaction: new Date(),
          prix_total,
          remise: remise || 0,
          frais,
          jeux: jeux.map(jeu => ({
            jeuId: new ObjectId(jeu.jeuId),
            quantite: jeu.quantites,
            prix_unitaire: jeu.prix,
          })),
        };

        await vendeursCollection.updateOne({ _id: new ObjectId(acheteur) }, { $inc: { solde: -frais + remise } });
        await transactionCollection.insertOne(newDepot);
        return res.status(201).json({ message: "Dépot créé avec succès.", transaction: newDepot });

      } else if (acheteur) {
        // Vente
        if (!ObjectId.isValid(acheteur)) {
          return res.status(400).json({ message: 'Un ID d\'acheteur valide est requis.' });
        }

        const acheteurExists = await acheteursCollection.findOne({ _id: new ObjectId(acheteur) });
        if (!acheteurExists) {
          return res.status(404).json({ message: 'L\'acheteur spécifié n\'existe pas.' });
        }

        const invalidJeux = [];
        for (const jeu of jeux) {
          const jeuData = await jeuxCollection.findOne({ _id: new ObjectId(jeu.jeuId) });
          if (!jeuData || jeuData.statut !== 'disponible') {
            invalidJeux.push(jeu.jeuId);
            continue;
          }

          if (jeuData.quantites < jeu.quantite) {
            return res.status(400).json({
              message: `Quantité pour le jeu ${jeuData._id} dépasse la quantité disponible (${jeuData.quantites}).`,
            });
          }
        }

        if (invalidJeux.length > 0) {
          return res.status(400).json({
            message: `Les jeux suivants ne sont pas disponibles ou sont invalides : ${invalidJeux.join(', ')}`,
          });
        }

        // Mise à jour des quantités et création de la transaction
        for (const jeu of jeux) {
          await jeuxCollection.updateOne({ _id: new ObjectId(jeu.jeuId) }, { $inc: { quantites: -jeu.quantite } });
          const jeuData = await jeuxCollection.findOne({ _id: new ObjectId(jeu.jeuId) });
          if (jeuData.quantites === 0) {
            await jeuxCollection.updateOne({ _id: new ObjectId(jeu.jeuId) }, { $set: { statut: 'vendu' } });
          }
        }

        //Pour chaque jeu vendu on modifie le solde du propriétaire (solde = solde + prix_unitaire * quantite)
        for (const jeu of jeux) {
          const jeuData = await jeuxCollection.findOne({ _id: new ObjectId(jeu.jeuId) });
          await vendeursCollection.updateOne({ _id: new ObjectId(jeuData.vendeurId) }, { $inc: { solde: jeu.prix_unitaire * jeu.quantite } });
        }

        const newVente = {
          statut: 'vente',
          gestionnaire: new ObjectId(gestionnaire),
          acheteur: new ObjectId(acheteur),
          date_transaction: new Date(),
          prix_total,
          remise: remise || 0,
          frais,
          jeux: jeux.map(jeu => ({
            jeuId: new ObjectId(jeu.jeuId),
            quantite: jeu.quantite,
            prix_unitaire: jeu.prix_unitaire,
          })),
        };

        //Pour chaque jeu vendu on modifie le solde du propriétaire (solde = solde + prix_unitaire * quantite)
        for (const jeu of newVente.jeux) {
          const jeuData = await jeuxCollection.findOne({ _id: new ObjectId(jeu.jeuId) });
          await vendeursCollection.updateOne({ _id: new ObjectId(jeuData.vendeurId) }, { $inc: { soldes: jeu.prix_unitaire * jeu.quantite } });
        }

        await transactionCollection.insertOne(newVente);
        return res.status(201).json({ message: "Vente créée avec succès.", transaction: newVente });
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions :', error);
      res.status(500).json({ message: 'Erreur serveur lors de la récupération des transactions.' });
    }
  }

  static async getFilteredTransactions(req, res) {
    try {
      const db = await connectToDatabase();
      const transactionCollection = db.collection("transactions");
      const vendeursCollection = db.collection("vendeurs");
      const acheteursCollection = db.collection("acheteurs");
      const gestionnaireCollection = db.collection("gestionnaires");
      const typeJeuxCollection = db.collection("typeJeux");
      const categoriesCollection = db.collection("categories");
      const jeuxCollection = db.collection("jeux");

      const {
        statut,
        proprietaire,
        acheteur,
        gestionnaire,
        remise,
        jeuId,
        prixMin,
        prixMax,
        proprietaireJeu,
        editeur,
        categorie,
        nameJeu,
      } = req.body;

      const filters = {};

      // Apply filters based on query parameters
      if (statut) {
        if (statut != 'depot' && statut != 'vente') {
          return res.status(400).json({ message: 'Statut invalide.' });
        }
        filters.statut = statut;
      }

      if (proprietaire && !ObjectId.isValid(proprietaire)) {
        return res.status(400).json({ message: 'ID de propriétaire invalide.' });
      }

      if (acheteur && !ObjectId.isValid(acheteur)) {
        return res.status(400).json({ message: 'ID d\'acheteur invalide.' });
      }

      if (gestionnaire && !ObjectId.isValid(gestionnaire)) {
        return res.status(400).json({ message: 'ID de gestionnaire invalide.' });
      }

      if (proprietaire) {
        const proprietaireExists = await vendeursCollection.findOne({ _id: new ObjectId(proprietaire) });
        if (!proprietaireExists) {
          return res.status(404).json({ message: 'Propriétaire non trouvé.' });
        }
        filters.proprietaire = new ObjectId(proprietaire);
      }

      if (acheteur) {
        const acheteurExists = await acheteursCollection.findOne({ _id: new ObjectId(acheteur) });
        if (!acheteurExists) {
          return res.status(404).json({ message: 'Acheteur non trouvé.' });
        }
        filters.acheteur = new ObjectId(acheteur);
      }

      if (gestionnaire) {
        const gestionnaireExists = await gestionnaireCollection.findOne({ _id: new ObjectId(gestionnaire) });
        if (!gestionnaireExists) {
          return res.status(404).json({ message: 'Gestionnaire non trouvé.' });
        }
        filters.gestionnaire = new ObjectId(gestionnaire);
      }

      if (jeuId && !ObjectId.isValid(jeuId)) {
        return res.status(400).json({ message: 'ID de jeu invalide.' });
      }

      if (jeuId) {
        const jeuExists = await jeuxCollection.findOne({ _id: new ObjectId(jeuId) });
        if (!jeuExists) {
          return res.status(404).json({ message: 'Jeu non trouvé.' });
        }
        filters.jeux = { $elemMatch: { jeuId: new ObjectId(jeuId) } };
      }

      //si il y a le parametre remise on le rajoute au filtre pour qu'il prenne ensuite que des transactions avec remise
      if (remise !== undefined) {
        filters.remise = { $gt: 0 };
      }

      if (prixMin !== undefined || prixMax !== undefined) {
        filters.prix_total = {};
        if (prixMin !== undefined) filters.prix_total.$gte = parseFloat(prixMin);
        if (prixMax !== undefined) filters.prix_total.$lte = parseFloat(prixMax);
      }

      //Ajout des filtres pour les jeux
      const jeuFilters = {};

      if (proprietaireJeu && !ObjectId.isValid(proprietaireJeu)) {
        return res.status(400).json({ message: 'ID de propriétaire du jeu invalide.' });
      }

      if (proprietaireJeu) {
        const proprietaireJeuExists = await vendeursCollection.findOne({ _id: new ObjectId(proprietaireJeu) });
        if (!proprietaireJeuExists) {
          return res.status(404).json({ message: 'Propriétaire du jeu non trouvé.' });
        }
        jeuFilters.vendeurId = new ObjectId(proprietaireJeu);
      }

      //on peut avoir plusieurs catégorie dans le paramètre catégorie
      if (categorie) {
        const categoryNames = Array.isArray(categorie) ? categorie : [categorie];
        const categories = await categoriesCollection.find({ name: { $in: categoryNames } }).toArray();
        const categoryIds = categories.map(category => category._id);
  
        if (categoryIds.length === 0) {
          return res.status(404).json({ message: `Aucune des catégories spécifiées (${categoryNames.join(", ")}) n'a été trouvée.` });
        }
        jeuFilters.categories = { $in: categoryIds };
      }

      if (editeur) {
        const typeJeux = await typeJeuxCollection.find({ editeur: editeur }).toArray();
        const typeJeuIds = typeJeux.map(typeJeu => typeJeu._id);
        if (typeJeuIds.length > 0) {
          jeuFilters.typeJeuId = { $in: typeJeuIds };
        } else {
          return res.status(404).json({ message: `Aucun jeu trouvé pour l'éditeur '${editeur}'.` });
        }
      }
      
      if (nameJeu) {
        const typeJeux = await typeJeuxCollection.find({ intitule: nameJeu }).toArray();
        const typeJeuIds = typeJeux.map(typeJeu => typeJeu._id);
        if (typeJeuIds.length > 0) {
          jeuFilters.typeJeuId = { $in: typeJeuIds };
        } else {
          return res.status(404).json({ message: `Aucun jeu trouvé du nom de '${nameJeu}'.` });
        }
      }

      // If no filters are applied, call getTransactions
      if (Object.keys(filters).length === 0) {
        return TransactionController.getTransactions(req, res);
      }

      const transactions = await transactionCollection.find(filters).toArray();
      const filteredTransactions = transactions.filter(transaction => 
        new Date(transaction.date_transaction) >= new Date(activeSession.dateDebut) &&
        new Date(transaction.date_transaction) <= new Date(activeSession.dateFin)
    );
      // Fetch related collections
        const gestionnaires = await gestionnaireCollection.find().toArray();
        const vendeurs = await vendeursCollection.find().toArray();
        const acheteurs = await acheteursCollection.find().toArray();
        const categories = await categoriesCollection.find().toArray();

        // Create maps for efficient lookups
        const gestionnairesMap = gestionnaires.reduce((map, g) => {
            map[g._id.toString()] = g.pseudo;
            return map;
        }, {});
        const vendeursMap = vendeurs.reduce((map, v) => {
            map[v._id.toString()] = v.nom;
            return map;
        }, {});
        const acheteursMap = acheteurs.reduce((map, a) => {
            map[a._id.toString()] = a.nom;
            return map;
        }, {});

        const categoriesMap = categories.reduce((map, categorie) => {
          map[categorie._id.toString()] = categorie.name;
          return map;
      }, {});

        // Build the detailed transactions
        const transactionsWithDetails = [];
        for (const transaction of filteredTransactions) {
            const jeuxDetails = [];
            for (const jeu of transaction.jeux) {
                // Find the jeu in the "jeux" collection
                const jeuData = await jeuxCollection.findOne({ _id: new ObjectId(jeu.jeuId) });
                if (!jeuData) continue;

                // Find the typeJeu associated with the jeu
                const typeJeu = await typeJeuxCollection.findOne({ _id: new ObjectId(jeuData.typeJeuId) });
                const proprietaire = await vendeursCollection.findOne({ _id: new ObjectId(jeuData.vendeurId) });
                // Map category IDs to names using the categoriesMap
                const categoryNames = (jeuData.categories || []).map(
                  catId => categoriesMap[catId.toString()] || "Inconnu"
              );

                // Add detailed jeu information
                jeuxDetails.push({
                    jeuId: jeu.jeuId,
                    intitule: typeJeu?.intitule || "Inconnu",
                    editeur: typeJeu?.editeur || "Inconnu",
                    quantite: jeu.quantite,
                    prix_unitaire: jeu.prix_unitaire,
                    vendeur: proprietaire.nom, // Add proprietaire ID from jeuData
                    categories: categoryNames,
                });
            }

            // Dynamically build the transaction object
            const transactionDetails = {
                id: transaction._id,
                statut: transaction.statut,
                gestionnaire: gestionnairesMap[transaction.gestionnaire?.toString()],
                date_transaction: transaction.date_transaction,
                prix_total: transaction.prix_total,
                frais: transaction.frais,
                remise: transaction.remise,
            };

            // Conditionally add proprietaire or acheteur if they exist
            if (transaction.proprietaire) {
                transactionDetails.proprietaire = vendeursMap[transaction.proprietaire.toString()];
            }
            if (transaction.acheteur) {
                transactionDetails.acheteur = acheteursMap[transaction.acheteur.toString()];
            }

            transactionDetails.jeux = jeuxDetails;
            transactionsWithDetails.push(transactionDetails);
        }

        res.status(200).json(transactionsWithDetails);
  } catch (error) {
    console.error('Erreur lors de la récupération des transactions filtrées :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des transactions filtrées.' });
  }
}

static async getTransactions(req, res) {
  try {
      const db = await connectToDatabase();
      const transactionCollection = db.collection("transactions");
      const gestionnaireCollection = db.collection("gestionnaires");
      const vendeursCollection = db.collection("vendeurs");
      const acheteursCollection = db.collection("acheteurs");
      const typeJeuxCollection = db.collection("typeJeux");
      const categoriesCollection = db.collection("categories");
      const jeuxCollection = db.collection("jeux");
      const sessionCollection = db.collection("session");

      const transactions = await transactionCollection.find().toArray();
      const activeSession = await sessionCollection.findOne({ statutSession: "En cours" });
      // Fetch related collections
      const gestionnaires = await gestionnaireCollection.find().toArray();
      const vendeurs = await vendeursCollection.find().toArray();
      const acheteurs = await acheteursCollection.find().toArray();
      const categories = await categoriesCollection.find().toArray();

      // Create maps for efficient lookups
      const gestionnairesMap = gestionnaires.reduce((map, g) => {
          map[g._id.toString()] = g.pseudo;
          return map;
      }, {});
      const vendeursMap = vendeurs.reduce((map, v) => {
          map[v._id.toString()] = v.nom;
          return map;
      }, {});
      const acheteursMap = acheteurs.reduce((map, a) => {
          map[a._id.toString()] = a.nom;
          return map;
      }, {});
      const categoriesMap = categories.reduce((map, categorie) => {
          map[categorie._id.toString()] = categorie.name;
          return map;
      }, {});

      if (!activeSession) {
        return res.status(400).json({ message: "Aucune session active en cours." });
      }
    
      // Filter transactions within the active session's date range
      const filteredTransactions = transactions.filter(transaction => 
        new Date(transaction.date_transaction) >= new Date(activeSession.dateDebut) &&
        new Date(transaction.date_transaction) <= new Date(activeSession.dateFin)
      );

      // Build the detailed transactions
      const transactionsWithDetails = [];
      for (const transaction of filteredTransactions) {
          const jeuxDetails = [];
          for (const jeu of transaction.jeux) {
              // Find the jeu in the "jeux" collection
              const jeuData = await jeuxCollection.findOne({ _id: new ObjectId(jeu.jeuId) });
              if (!jeuData) continue;

              // Find the typeJeu associated with the jeu
              const typeJeu = await typeJeuxCollection.findOne({ _id: new ObjectId(jeuData.typeJeuId) });
              const proprietaire = await vendeursCollection.findOne({ _id: new ObjectId(jeuData.vendeurId) });

              // Map category IDs to names using the categoriesMap
              const categoryNames = (jeuData.categories || []).map(
                  catId => categoriesMap[catId.toString()] || "Inconnu"
              );

              // Add detailed jeu information
              jeuxDetails.push({
                  jeuId: jeu.jeuId,
                  intitule: typeJeu?.intitule || "Inconnu",
                  editeur: typeJeu?.editeur || "Inconnu",
                  quantite: jeu.quantite,
                  prix_unitaire: jeu.prix_unitaire,
                  vendeur: proprietaire?.nom || "Inconnu",
                  categories: categoryNames,
              });
          }

          // Dynamically build the transaction object
          const transactionDetails = {
              id: transaction._id,
              statut: transaction.statut,
              gestionnaire: gestionnairesMap[transaction.gestionnaire?.toString()],
              date_transaction: transaction.date_transaction,
              prix_total: transaction.prix_total,
              frais: transaction.frais,
              remise: transaction.remise,
          };

          // Conditionally add proprietaire or acheteur if they exist
          if (transaction.proprietaire) {
              transactionDetails.proprietaire = vendeursMap[transaction.proprietaire.toString()];
          }
          if (transaction.acheteur) {
              transactionDetails.acheteur = acheteursMap[transaction.acheteur.toString()];
          }

          transactionDetails.jeux = jeuxDetails;
          transactionsWithDetails.push(transactionDetails);
      }

      res.status(200).json(transactionsWithDetails);
  } catch (error) {
      console.error('Erreur lors de la récupération des transactions :', error);
      res.status(500).json({ message: 'Erreur serveur lors de la récupération des transactions.' });
  }
}

  static async getTransactionById(req, res) {
    try {
        const db = await connectToDatabase();
        const transactionCollection = db.collection('transactions');
        const gestionnaireCollection = db.collection('gestionnaires');
        const vendeursCollection = db.collection('vendeurs');
        const acheteursCollection = db.collection('acheteurs');
        const typeJeuxCollection = db.collection('typeJeux');
        const categoriesCollection = db.collection('categories');
        const jeuxCollection = db.collection('jeux');

        const transaction = await transactionCollection.findOne({ _id: new ObjectId(req.params.id) });

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction non trouvée.' });
        }

        // Fetch related collections
        const gestionnaire = transaction.gestionnaire
            ? await gestionnaireCollection.findOne({ _id: new ObjectId(transaction.gestionnaire) })
            : null;

        const proprietaire = transaction.proprietaire
            ? await vendeursCollection.findOne({ _id: new ObjectId(transaction.proprietaire) })
            : null;

        const acheteur = transaction.acheteur
            ? await acheteursCollection.findOne({ _id: new ObjectId(transaction.acheteur) })
            : null;

        const categories = await categoriesCollection.find().toArray();
        const categoriesMap = categories.reduce((map, categorie) => {
            map[categorie._id.toString()] = categorie.name;
            return map;
        }, {});

        const jeuxDetails = [];
        for (const jeu of transaction.jeux) {
            const jeuData = await jeuxCollection.findOne({ _id: new ObjectId(jeu.jeuId) });
            if (!jeuData) continue;

            const typeJeu = await typeJeuxCollection.findOne({ _id: new ObjectId(jeuData.typeJeuId) });
            const vendeur = await vendeursCollection.findOne({ _id: new ObjectId(jeuData.vendeurId) });

            // Map category IDs to names using the categoriesMap
            const categoryNames = (jeuData.categories || []).map(
                catId => categoriesMap[catId.toString()] || "Inconnu"
            );

            jeuxDetails.push({
                jeuId: jeu.jeuId,
                intitule: typeJeu?.intitule || "Inconnu",
                editeur: typeJeu?.editeur || "Inconnu",
                quantite: jeu.quantite,
                prix_unitaire: jeu.prix_unitaire,
                vendeur: vendeur?.nom || "Inconnu",
                categories: categoryNames,
            });
        }

        // Build the detailed transaction
        const transactionDetails = {
            id: transaction._id,
            statut: transaction.statut,
            gestionnaire: gestionnaire?.pseudo || "Inconnu",
            date_transaction: transaction.date_transaction,
            prix_total: transaction.prix_total,
            frais: transaction.frais,
            remise: transaction.remise,
        };

        // Conditionally add proprietaire or acheteur if they exist
        if (proprietaire) {
            transactionDetails.proprietaire = proprietaire.nom;
        }
        if (acheteur) {
            transactionDetails.acheteur = acheteur.nom;
        }

        transactionDetails.jeux = jeuxDetails;

        res.status(200).json(transactionDetails);
    } catch (error) {
        console.error('Erreur lors de la récupération de la transaction :', error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération de la transaction.' });
    }
}


  static async updateTransaction(req, res) {
    const id = req.params.id;
    const { proprietaire, acheteur, jeux, prix_total, frais, remise } = req.body;

    try {
      const db = await connectToDatabase();
      const transactionsCollection = db.collection("transactions");
      const vendeursCollection = db.collection("vendeurs");
      const acheteursCollection = db.collection("acheteurs");
      const jeuxCollection = db.collection("jeux");

      // Validate transaction ID
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'ID de transaction invalide.' });
      }

      const existingTransaction = await transactionsCollection.findOne({ _id: new ObjectId(id) });
      if (!existingTransaction) {
        return res.status(404).json({ message: 'Transaction non trouvée.' });
      }

      // Validate proprietaire or acheteur (one is required, not both)
      if (!proprietaire && !acheteur) {
        return res.status(400).json({ message: 'Un propriétaire ou un acheteur est requis.' });
      }

      if (proprietaire && acheteur) {
        return res.status(400).json({ message: 'Un propriétaire ou un acheteur est requis, pas les deux.' });
      }

      if (proprietaire && !ObjectId.isValid(proprietaire)) {
        return res.status(400).json({ message: 'ID de propriétaire invalide.' });
      }

      if (acheteur && !ObjectId.isValid(acheteur)) {
        return res.status(400).json({ message: 'ID d\'acheteur invalide.' });
      }

      if (proprietaire) {
        const proprietaireExists = await vendeursCollection.findOne({ _id: new ObjectId(proprietaire) });
        if (!proprietaireExists) {
          return res.status(404).json({ message: 'Propriétaire non trouvé.' });
        }
      }

      if (acheteur) {
        const acheteurExists = await acheteursCollection.findOne({ _id: new ObjectId(acheteur) });
        if (!acheteurExists) {
          return res.status(404).json({ message: 'Acheteur non trouvé.' });
        }
      }

      // Extract existing jeux and compare with the new jeux
      const existingJeux = existingTransaction.jeux || [];
      const newJeuxMap = new Map(jeux.map(jeu => [jeu.jeuId, jeu]));

      const removedJeux = existingJeux.filter(jeu => !newJeuxMap.has(jeu.jeuId.toString()));
      const addedJeux = jeux.filter(jeu => !existingJeux.some(eJeu => eJeu.jeuId.toString() === jeu.jeuId));

      // Handle removed jeux
      for (const jeu of removedJeux) {
        const jeuData = await jeuxCollection.findOne({ _id: new ObjectId(jeu.jeuId) });

        if (existingTransaction.statut === 'depot') {
          // Revert dépôt updates for the jeu
          await jeuxCollection.updateOne({ _id: new ObjectId(jeu.jeuId) }, { $inc: { quantites: jeu.quantite } });
        } else if (existingTransaction.statut === 'vente') {
          // Revert vente updates for the jeu
          await jeuxCollection.updateOne({ _id: new ObjectId(jeu.jeuId) }, { $inc: { quantites: jeu.quantite } });
          if (jeuData.quantites === 0) {
            await jeuxCollection.updateOne({ _id: new ObjectId(jeu.jeuId) }, { $set: { statut: 'disponible' } });
          }
          await vendeursCollection.updateOne(
            { _id: new ObjectId(jeuData.vendeurId) },
            { $inc: { soldes: -(jeu.prix_unitaire * jeu.quantite) } }
          );
        }
      }

      // Handle added jeux
      for (const jeu of addedJeux) {
        const jeuData = await jeuxCollection.findOne({ _id: new ObjectId(jeu.jeuId) });

        if (existingTransaction.statut === 'depot') {
          // Apply dépôt updates for the jeu
          await jeuxCollection.updateOne({ _id: new ObjectId(jeu.jeuId) }, { $inc: { quantites: -jeu.quantite } });
        } else if (existingTransaction.statut === 'vente') {
          // Apply vente updates for the jeu
          await jeuxCollection.updateOne({ _id: new ObjectId(jeu.jeuId) }, { $inc: { quantites: -jeu.quantite } });
          if (jeuData.quantites === 0) {
            await jeuxCollection.updateOne({ _id: new ObjectId(jeu.jeuId) }, { $set: { statut: 'vendu' } });
          }
          await vendeursCollection.updateOne(
            { _id: new ObjectId(jeuData.vendeurId) },
            { $inc: { soldes: jeu.prix_unitaire * jeu.quantite } }
          );
        }
      }

      // Validate prix_total, frais, and remise
      if (!prix_total || prix_total <= 0) {
        return res.status(400).json({ message: 'Un prix total valide est requis.' });
      }

      if (!frais || frais < 0) {
        return res.status(400).json({ message: 'Des frais valides sont requis.' });
      }

      if (remise < 0 || remise > frais) {
        return res.status(400).json({ message: 'La remise doit être comprise entre 0 et les frais.' });
      }

      // Update the transaction
      const updatedTransaction = {
        proprietaire: proprietaire ? new ObjectId(proprietaire) : null,
        acheteur: acheteur ? new ObjectId(acheteur) : null,
        jeux: jeux.map(jeu => ({
          jeuId: new ObjectId(jeu.jeuId),
          quantite: jeu.quantite,
          prix_unitaire: jeu.prix_unitaire,
        })),
        prix_total,
        frais,
        remise: remise || 0,
        updatedAt: new Date(),
      };

      const result = await transactionsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedTransaction }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Transaction non trouvée.' });
      }

      res.status(200).json({ message: 'Transaction mise à jour avec succès.' });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la transaction :', error);
      res.status(500).json({ message: 'Erreur serveur lors de la mise à jour de la transaction.' });
    } finally {
      await client.close();
    }
  }

  static async deleteTransaction(req, res) {
    //on supprime d'abords la transaction
    try {
      const db = await connectToDatabase();
      const transactionCollection = db.collection('transactions');
      const transaction = await transactionCollection.findOne({ _id: new ObjectId(req.params.id) });
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction non trouvée.' });
      }
      await transactionCollection.deleteOne({ _id: new ObjectId(req.params.id) });
      res.status(200).json({ message: 'Transaction supprimée avec succès.' });
      //pour chaque jeux on vérifie si le jeu à en statut vendu si oui on le remet en disponible
      const jeuxCollection = db.collection("jeux");
      for (const jeu of transaction.jeux) {
        const jeuData = await jeuxCollection.findOne({ _id: new ObjectId(jeu.jeuId) });
        if (jeuData.statut === 'vendu') {
          await jeuxCollection.updateOne({ _id: new ObjectId(jeu.jeuId) }, { $set: { statut: 'disponible' } });
        }
        //on remet ensuite les quantités
        await jeuxCollection.updateOne({ _id: new ObjectId(jeu.jeuId) }, { $inc: { quantites: jeu.quantite } });

        if (transaction.statut === 'vente') {
          //pour chaque jeu vendu on modifie le solde du propriétaire (solde = solde - prix_unitaire * quantite)
          for (const jeu of transaction.jeux) {
            const jeuData = await jeuxCollection.findOne({ _id: new ObjectId(jeu.jeuId) });
            await vendeursCollection.updateOne({ _id: new ObjectId(jeuData.vendeurId) }, { $inc: { soldes: -jeu.prix_unitaire * jeu.quantite } });
          }
        } else if (transaction.statut === 'depot') {
          //On met à jour le solde du propriétaire (soldes = soldes + frais + prix_total)
          await vendeursCollection.updateOne({ _id: new ObjectId(transaction.proprietaire) }, { $inc: { soldes: transaction.frais + transaction.prix_total } });
        }
      }


    } catch (error) {
      console.error('Erreur lors de la suppression de la transaction :', error);
      res.status(500).json({ message: 'Erreur serveur lors de la suppression de la transaction.' });
    }
  }
}

module.exports = TransactionController;
