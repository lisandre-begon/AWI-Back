const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb+srv://lisandrebegon1:czbssegw5de6kicv@awidatabase.1z4go.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const connectToDatabase = require('../config/database');

class AcheteurController {
    static async createAcheteur(req, res) {
        try {
            const db = await connectToDatabase();
            const acheteursCollection = db.collection("acheteurs");

            const { nom, prenom, email, adresse } = req.body;

            if (!nom) return res.status(400).json({ message: 'Le nom est requis.' });
            if (!prenom) return res.status(400).json({ message: 'Le prénom est requis.' });
            if (!email) return res.status(400).json({ message: 'L\'email est requis.' });
            if (!emailRegex.test(email)) {
                return res.status(400).json({ message: 'L\'email fourni n\'est pas valide.' });
            }
            if (!adresse) return res.status(400).json({ message: 'L\'adresse est requise.' });

            const existingAcheteur = await acheteursCollection.findOne({ email });
            if (existingAcheteur) {
                return res.status(400).json({ message: 'Cet acheteur existe déjà.' });
            }

            const newAcheteur = {
                nom,
                prenom,
                email,
                adresse,
                createdAt: new Date(),
            };

            await acheteursCollection.insertOne(newAcheteur);

            res.status(201).json({ message: 'Acheteur créé avec succès.' });
        } catch (error) {
            console.error('Erreur lors de la création de l\'acheteur:', error);
            res.status(500).json({ message: 'Erreur serveur lors de la création de l\'acheteur.' });
        } finally {
            await client.close();
        }
    }

    static async getAcheteurById(req, res) {
        const id = req.params.id;
        try {
            const db = await connectToDatabase();
            const acheteursCollection = db.collection("acheteurs");

            if (!ObjectId.isValid(id)) {
                return res.status(404).json({ message: 'Acheteur non trouvé.' });
            }

            const acheteur = await acheteursCollection.findOne({ _id: new ObjectId(id) }, {projection: {createdAt: 0, updatedAt: 0}});
            if (!acheteur) {
                return res.status(404).json({ message: 'Acheteur non trouvé.' });
            }

            res.status(200).json(acheteur);
        } catch (error) {
            console.error(`Erreur lors de la récupération de l\'acheteur avec l\'ID ${id}:`, error);
            res.status(500).json({ message: 'Erreur lors de la récupération de l\'acheteur' });
        } finally {
            await client.close();
        }
    }

    static async getAllAcheteurs(req, res) {
        try {
            const db = await connectToDatabase();
            const acheteursCollection = db.collection("acheteurs");

            const acheteurs = await acheteursCollection.find({}, {projection: {createdAt: 0, updatedAt: 0}}).toArray();

            res.status(200).json(acheteurs);
        } catch (error) {
            console.error('Erreur lors de la récupération des acheteurs:', error);
            res.status(500).json({ message: 'Erreur lors de la récupération des acheteurs' });
        } finally {
            await client.close();
        }
    }

    static async updateAcheteur(req, res) {
        try {
            const db = await connectToDatabase();
            const acheteursCollection = db.collection("acheteurs");
            const id = req.params.id;
    
            if (!ObjectId.isValid(id)) {
                return res.status(404).json({ message: "ID de acheteur invalide." });
            }
    
            const updatedFields = {};
            if (req.body.nom !== undefined) updatedFields.nom = req.body.nom;
            if (req.body.prenom !== undefined) updatedFields.prenom = req.body.prenom;
            if (req.body.email !== undefined) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(req.body.email)) {
                    return res.status(400).json({ message: "Email non valide." });
                }
                updatedFields.email = req.body.email;
                const email = req.body.email;
                const existingAcheteur = await acheteursCollection.findOne({ email });
                if (existingAcheteur) {
                return res.status(400).json({ message: 'Email déjà utilisé.' });
            }

            }
            if (req.body.telephone !== undefined) updatedFields.telephone = req.body.telephone;
            if (req.body.adresse !== undefined) updatedFields.adresse = req.body.adresse;
    
            if (Object.keys(updatedFields).length === 0) {
                return res.status(400).json({ message: "Aucun champ valide à mettre à jour." });
            }

    
            updatedFields.updatedAt = new Date();
    
            const result = await acheteursCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updatedFields }
            );
    
            if (result.matchedCount === 0) {
                return res.status(404).json({ message: "Acheteur non trouvé." });
            }
    
            res.status(200).json({ message: "Acheteur mis à jour avec succès." });
        } catch (error) {
            console.error("Erreur lors de la mise à jour du acheteur:", error);
            res.status(500).json({ message: "Erreur serveur lors de la mise à jour du acheteur." });
        }
    }

    static async deleteAcheteur(req, res) {
        const id = req.params.id;
        try {
            const db = await connectToDatabase();
            const acheteursCollection = db.collection("acheteurs");

            if (!ObjectId.isValid(id)) {
                return res.status(404).json({ message: 'Acheteur non trouvé.' });
            }

            const result = await acheteursCollection.deleteOne({ _id: new ObjectId(id) });

            if (result.deletedCount === 0) {
                return res.status(404).json({ message: 'Acheteur non trouvé.' });
            }

            res.status(200).json({ message: 'Acheteur supprimé avec succès.' });
        } catch (error) {
            console.error(`Erreur lors de la suppression de l\'acheteur avec l\'ID ${id}:`, error);
            res.status(500).json({ message: 'Erreur lors de la suppression de l\'acheteur' });
        } finally {
            await client.close();
        }
    }
}

module.exports = AcheteurController;
