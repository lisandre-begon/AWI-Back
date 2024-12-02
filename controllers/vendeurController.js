const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://lisandrebegon1:czbssegw5de6kicv@awidatabase.1z4go.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

class VendeurController {
    static async createVendeur(req, res) {
        try {
            // Connect to MongoDB
            await client.connect();
            const db = client.db("awidatabase"); // Use your database name
            const vendeursCollection = db.collection("vendeurs"); // Use your collection name

            const { nom, prenom, email, telephone } = req.body;

            // Validation: Check if all required fields are provided
            if (!nom) return res.status(400).json({ message: 'Le nom est requis.' });
            if (!prenom) return res.status(400).json({ message: 'Le prénom est requis.' });
            if (!email) return res.status(400).json({ message: 'L\'email est requis.' });
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ message: 'L\'email fourni n\'est pas valide.' });
            }
            if (!telephone) return res.status(400).json({ message: 'Le numéro de téléphone est requis.' });

            // Check if the vendeur already exists
            const existingVendeur = await vendeursCollection.findOne({ email });
            if (existingVendeur) {
                return res.status(400).json({ message: 'Ce vendeur existe déjà.' });
            }

            // Create a new vendeur document
            const newVendeur = {
                nom,
                prenom,
                email,
                telephone,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // Insert the new vendeur into the collection
            const result = await vendeursCollection.insertOne(newVendeur);

            // Respond with the created vendeur
            res.status(201).json({
                message: 'Vendeur créé avec succès.',
                vendeur: result.ops[0]
            });
        } catch (error) {
            console.error('Erreur lors de la création du vendeur:', error);
            res.status(500).json({ message: 'Erreur serveur lors de la création du vendeur.' });
        } finally {
            // Ensure the MongoDB client is closed
            await client.close();
        }
    }

    static async getVendeurById(req, res) {
        const id = req.params.id;
        try {
            // Connect to MongoDB
            await client.connect();
            const db = client.db("awidatabase"); // Use your database name
            const vendeursCollection = db.collection("vendeurs"); // Use your collection name

            // Find the vendeur by ID
            const vendeur = await vendeursCollection.findOne({ _id: new MongoClient.ObjectID(id) });
            if (!vendeur) {
                return res.status(404).json({ message: 'Vendeur non trouvé.' });
            }

            // Respond with the found vendeur
            res.status(200).json(vendeur);
        } catch (error) {
            console.error(`Erreur lors de la récupération du vendeur avec l'ID ${id}:`, error);
            res.status(500).json({ message: 'Erreur lors de la récupération du vendeur' });
        } finally {
            // Ensure the MongoDB client is closed
            await client.close();
        }
    }

    static async getAllVendeurs(res) {
        try {
            // Connect to MongoDB
            await client.connect();
            const db = client.db("awidatabase"); // Use your database name
            const vendeursCollection = db.collection("vendeurs"); // Use your collection name

            // Find all vendeurs
            const vendeurs = await vendeursCollection.find().toArray();

            // Respond with the found vendeurs
            res.status(200).json(vendeurs);
        } catch (error) {
            console.error('Erreur lors de la récupération des vendeurs:', error);
            res.status(500).json({ message: 'Erreur lors de la récupération des vendeurs' });
        } finally {
            // Ensure the MongoDB client is closed
            await client.close();
        }
    }
}

module.exports = VendeurController;