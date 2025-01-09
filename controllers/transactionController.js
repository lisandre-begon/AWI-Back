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
      const acheteursCollection = db.collection("acheteurs");

      const { gestionnaire, proprietaire, acheteur, prix_total, frais, jeux } = req.body;

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

          if (!jeuData.vendeurId.equals(new ObjectId(proprietaire))) {
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

        // Créez la transaction pour le dépôt
        const newDepot = {
          statut: 'depot',
          gestionnaire: new ObjectId(gestionnaire),
          proprietaire: new ObjectId(proprietaire),
          date_transaction: new Date(),
          prix_total,
          frais,
          jeux: jeux.map(jeu => ({
            jeuId: new ObjectId(jeu.jeuId),
            quantite: jeu.quantite,
            prix_unitaire: jeu.prix_unitaire,
          })),
        };

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

        const newVente = {
          statut: 'vente',
          gestionnaire: new ObjectId(gestionnaire),
          acheteur: new ObjectId(acheteur),
          date_transaction: new Date(),
          prix_total,
          frais,
          jeux: jeux.map(jeu => ({
            jeuId: new ObjectId(jeu.jeuId),
            quantite: jeu.quantite,
            prix_unitaire: jeu.prix_unitaire,
          })),
        };

        await transactionCollection.insertOne(newVente);
        return res.status(201).json({ message: "Vente créée avec succès.", transaction: newVente });
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions :', error);
      res.status(500).json({ message: 'Erreur serveur lors de la récupération des transactions.' });
    }
  }
}

module.exports = TransactionController;
