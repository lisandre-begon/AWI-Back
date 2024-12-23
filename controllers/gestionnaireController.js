const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb+srv://lisandrebegon1:czbssegw5de6kicv@awidatabase.1z4go.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

class GestionnaireController {
    static async createGestionnaire(req, res) {
        try {
            await client.connect();
            const db = client.db("awidatabase");
            const gestionnairesCollection = db.collection("gestionnaires");

            const { pseudo, mot_de_passe } = req.body;

            if (!pseudo) return res.status(400).json({ message: 'Le pseudo est requis.' });
            if (!mot_de_passe) return res.status(400).json({ message: 'Le mot de passe est requis.' });

            const existingGestionnaire = await gestionnairesCollection.findOne({ pseudo });
            if (existingGestionnaire) {
                return res.status(400).json({ message: 'Ce pseudo est déjà utilisé.' });
            }

            const newGestionnaire = {
                pseudo,
                mot_de_passe,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            await gestionnairesCollection.insertOne(newGestionnaire);

            res.status(201).json({ message: 'Gestionnaire créé avec succès.' });
        } catch (error) {
            console.error('Erreur lors de la création du gestionnaire:', error);
            res.status(500).json({ message: 'Erreur serveur lors de la création du gestionnaire.' });
        } finally {
            await client.close();
        }
    }

    static async getGestionnaireById(req, res) {
        const id = req.params.id;
        try {
            await client.connect();
            const db = client.db("awidatabase");
            const gestionnairesCollection = db.collection("gestionnaires");

            if (!ObjectId.isValid(id)) {
                return res.status(404).json({ message: 'Gestionnaire non trouvé.' });
            }

            const gestionnaire = await gestionnairesCollection.findOne({ _id: new ObjectId(id) });
            if (!gestionnaire) {
                return res.status(404).json({ message: 'Gestionnaire non trouvé.' });
            }

            res.status(200).json(gestionnaire);
        } catch (error) {
            console.error(`Erreur lors de la récupération du gestionnaire avec l'ID ${id}:`, error);
            res.status(500).json({ message: 'Erreur lors de la récupération du gestionnaire' });
        } finally {
            await client.close();
        }
    }

    static async getAllGestionnaires(req, res) {
        try {
            await client.connect();
            const db = client.db("awidatabase");
            const gestionnairesCollection = db.collection("gestionnaires");

            const gestionnaires = await gestionnairesCollection.find().toArray();

            res.status(200).json(gestionnaires);
        } catch (error) {
            console.error('Erreur lors de la récupération des gestionnaires:', error);
            res.status(500).json({ message: 'Erreur lors de la récupération des gestionnaires' });
        } finally {
            await client.close();
        }
    }

    static async updateGestionnaire(req, res) {
        const id = req.params.id;
        try {
            await client.connect();
            const db = client.db("awidatabase");
            const gestionnairesCollection = db.collection("gestionnaires");

            if (!ObjectId.isValid(id)) {
                return res.status(404).json({ message: 'Gestionnaire non trouvé.' });
            }

            const updatedGestionnaire = {
                $set: {
                    pseudo: req.body.pseudo,
                    mot_de_passe: req.body.mot_de_passe,
                    updatedAt: new Date(),
                },
            };

            const result = await gestionnairesCollection.updateOne({ _id: new ObjectId(id) }, updatedGestionnaire);

            if (result.matchedCount === 0) {
                return res.status(404).json({ message: 'Gestionnaire non trouvé.' });
            }

            res.status(200).json({ message: 'Gestionnaire mis à jour avec succès.' });
        } catch (error) {
            console.error('Erreur lors de la mise à jour du gestionnaire:', error);
            res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du gestionnaire.' });
        } finally {
            await client.close();
        }
    }

    static async deleteGestionnaire(req, res) {
        const id = req.params.id;
        try {
            await client.connect();
            const db = client.db("awidatabase");
            const gestionnairesCollection = db.collection("gestionnaires");

            if (!ObjectId.isValid(id)) {
                return res.status(404).json({ message: 'Gestionnaire non trouvé.' });
            }

            const result = await gestionnairesCollection.deleteOne({ _id: new ObjectId(id) });

            if (result.deletedCount === 0) {
                return res.status(404).json({ message: 'Gestionnaire non trouvé.' });
            }

            res.status(200).json({ message: 'Gestionnaire supprimé avec succès.' });
        } catch (error) {
            console.error(`Erreur lors de la suppression du gestionnaire avec l'ID ${id}:`, error);
            res.status(500).json({ message: 'Erreur lors de la suppression du gestionnaire' });
        } finally {
            await client.close();
        }
    }
}

module.exports = GestionnaireController;
