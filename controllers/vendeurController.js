const { MongoClient, ObjectId } = require('mongodb');
const connectToDatabase = require('../config/database');

const uri = "mongodb+srv://lisandrebegon1:czbssegw5de6kicv@awidatabase.1z4go.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class VendeurController {
    static async createVendeur(req, res) {
        try {
            const db = await connectToDatabase();
            const vendeursCollection = db.collection("vendeurs");

            const { nom, prenom, email, telephone } = req.body;
            const solde = 0;

            if (!nom) return res.status(400).json({ message: 'Le nom est requis.' });
            if (!prenom) return res.status(400).json({ message: 'Le prénom est requis.' });
            if (!email) return res.status(400).json({ message: 'L\'email est requis.' });
            if (!emailRegex.test(email)) {
                return res.status(400).json({ message: 'L\'email fourni n\'est pas valide.' });
            }
            if (!telephone) return res.status(400).json({ message: 'Le numéro de téléphone est requis.' });

            const existingVendeur = await vendeursCollection.findOne({ email });
            if (existingVendeur) {
                return res.status(400).json({ message: 'Ce vendeur existe déjà.' });
            }

            const newVendeur = {
                nom,
                prenom,
                email,
                telephone,
                soldes: solde,
                createdAt: new Date(),
            };

            await vendeursCollection.insertOne(newVendeur);

            res.status(201).json({ message: 'Vendeur créé avec succès.' });
        } catch (error) {
            console.error('Erreur lors de la création du vendeur:', error);
            res.status(500).json({ message: 'Erreur serveur lors de la création du vendeur.' });
        } finally {
            await client.close();
        }
    }

    static async getVendeurById(req, res) {
        const id = req.params.id;
        try {
            const db = await connectToDatabase();
            const vendeursCollection = db.collection("vendeurs");

            if (!ObjectId.isValid(id)) {
                return res.status(404).json({ message: 'Vendeur non valide.' });
            }

            const vendeur = await vendeursCollection.findOne({ _id: new ObjectId(id) }, { projection: { updatedAt: 0, createdAt: 0 } });
            if (!vendeur) {
                return res.status(404).json({ message: 'Vendeur non trouvé.' });
            }

            res.status(200).json(vendeur);
        } catch (error) {
            console.error(`Erreur lors de la récupération du vendeur avec l'ID ${id}:`, error);
            res.status(500).json({ message: 'Erreur lors de la récupération du vendeur' });
        } finally {
            await client.close();
        }
    }

    static async getAllVendeurs(req, res) {
        try {
            const db = await connectToDatabase();
            const vendeursCollection = db.collection("vendeurs");

            const vendeurs = await vendeursCollection.find({}, { projection: { updatedAt: 0, createdAt: 0 } }).toArray();

            res.status(200).json(vendeurs);
        } catch (error) {
            console.error('Erreur lors de la récupération des vendeurs:', error);
            res.status(500).json({ message: 'Erreur lors de la récupération des vendeurs' });
        } finally {
            await client.close();
        }
    }

    static async updateVendeur(req, res) {
        try {
            const db = await connectToDatabase();
            const vendeursCollection = db.collection("vendeurs");
            const id = req.params.id;
    
            if (!ObjectId.isValid(id)) {
                return res.status(404).json({ message: "ID de vendeur invalide." });
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
                const existingVendeur = await vendeursCollection.findOne({ email });
                if (existingVendeur) {
                return res.status(400).json({ message: 'Email déjà utilisé.' });
            }

            }
            if (req.body.telephone !== undefined) updatedFields.telephone = req.body.telephone;
            if (req.body.soldes !== undefined) updatedFields.soldes = req.body.soldes;
    
            if (Object.keys(updatedFields).length === 0) {
                return res.status(400).json({ message: "Aucun champ valide à mettre à jour." });
            }

    
            updatedFields.updatedAt = new Date();
    
            const result = await vendeursCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updatedFields }
            );
    
            if (result.matchedCount === 0) {
                return res.status(404).json({ message: "Vendeur non trouvé." });
            }
    
            res.status(200).json({ message: "Vendeur mis à jour avec succès." });
        } catch (error) {
            console.error("Erreur lors de la mise à jour du vendeur:", error);
            res.status(500).json({ message: "Erreur serveur lors de la mise à jour du vendeur." });
        }
    }
    

    static async deleteVendeur(req, res) {
        const id = req.params.id;
        try {
            const db = await connectToDatabase();
            const vendeursCollection = db.collection("vendeurs");

            if (!ObjectId.isValid(id)) {
                return res.status(404).json({ message: 'Vendeur non valide.' });
            }

            const result = await vendeursCollection.deleteOne({ _id: new ObjectId(id) });

            if (result.deletedCount === 0) {
                return res.status(404).json({ message: 'Vendeur non trouvé.' });
            }

            res.status(200).json({ message: 'Vendeur supprimé avec succès.' });
        } catch (error) {
            console.error(`Erreur lors de la suppression du vendeur avec l'ID ${id}:`, error);
            res.status(500).json({ message: 'Erreur lors de la suppression du vendeur' });
        } finally {
            await client.close();
        }
    }

    static async resetSolde(req, res) {
        try {
            const db = await connectToDatabase();
            const vendeursCollection = db.collection("vendeurs");
            const id = req.params.id;
            

            if (!ObjectId.isValid(id)) {
                return res.status(404).json({ message: 'Vendeur pas valide.' });
            }

            const vendeur = await vendeursCollection.findOne({ _id: new ObjectId(id) });
            if (!vendeur) {
                return res.status(404).json({ message: 'Vendeur non trouvé.' });
            }

            const updateVendeur = {
                $set: {
                    soldes: 0,
                }
            }

            await vendeursCollection.updateOne({ _id: new ObjectId(id) }, updateVendeur);
            return res.status(200).json({ message: 'Solde réinitialisé avec succès.' });
        }
        catch {
            console.error('Erreur lors du reset du solde.');
            return res.status(500).json({message: 'Erreur lors du reset du solde.'});
        }
        finally {
            await client.close();
        }
    }
}

module.exports = VendeurController;
