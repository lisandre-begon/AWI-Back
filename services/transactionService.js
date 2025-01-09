const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb+srv://lisandrebegon1:czbssegw5de6kicv@awidatabase.1z4go.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

class TransactionService {
  static async createDepot({req, res}) {
    try {
      await client.connect();
      const db = client.db("awidatabase");
      const transactionCollection = db.collection("transactions");
      const { gestionnaire, proprietaire, prix_total, frais, jeux } = req.body;

      const newDepot = {
        statut: 'depot',
        gestionnaire: new ObjectId(gestionnaire), 
        proprietaire: new ObjectId(proprietaire),
        date_depot: new Date(),
        prix_total,
        frais,
        jeux: jeux.map(jeuId => new ObjectId(jeuId)),
      };

      // Insère la transaction dans la collection
      await transactionCollection.insertOne(newDepot);

      return { message: "Dépot créé avec succès.", transaction: newDepot };
    } catch (error) {
      console.error('Erreur lors de la création du dépot :', error);
      throw new Error('Erreur serveur lors de la création du dépôt.');
    } finally {
      await client.close();
    }
  }

  static async createVente({ gestionnaire, acheteur, prix_total, frais, jeux }) {
    try {
      await client.connect();
      const db = client.db("awidatabase");
      const transactionCollection = db.collection("transactions");

      const newVente = {
        statut: 'vente',
        gestionnaire: new ObjectId(gestionnaire),
        acheteur: new ObjectId(acheteur),
        date_transaction: new Date(),
        prix_total,
        frais,
        jeux: jeux.map(jeuId => new ObjectId(jeuId)),
      };

      // Insère la transaction dans la collection
      await transactionCollection.insertOne(newVente);

      return { message: "Vente créée avec succès.", transaction: newVente };
    } catch (error) {
      console.error('Erreur lors de la création de la vente :', error);
      throw new Error('Erreur serveur lors de la création de la vente.');
    } finally {
      await client.close();
    }
  }
}

module.exports = TransactionService;
