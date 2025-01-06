const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb+srv://lisandrebegon1:czbssegw5de6kicv@awidatabase.1z4go.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

class TypeJeuController {
    static async createTypeJeu(req, res) {
        try {
            await client.connect();
            const db = client.db("awidatabase");
            const typeJeuCollection = db.collection("typeJeux");

            const { intitule, editeur } = req.body;

            if (!intitule) return res.status(400).json({ message: 'L\'intitulé est requis.' });
            if (!editeur) return res.status(400).json({ message: 'L\'éditeur est requis.' });

            const existingTypeJeu = await typeJeuCollection.findOne({ intitule });
            if (existingTypeJeu) {
                return res.status(400).json({ message: 'Cet intitulé est déjà utilisé.' });
            }

            const newTypeJeu = {
                intitule,
                editeur,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            await typeJeuCollection.insertOne(newTypeJeu);

            res.status(201).json({ message: 'Type de jeu créé avec succès.' });
        } catch (error) {
            console.error('Erreur lors de la création du type de jeu:', error);
            res.status(500).json({ message: 'Erreur serveur lors de la création du type de jeu.' });
        } finally {
            await client.close();
        }
    }

    static async getTypeJeuById(req, res) {
        const id = req.params.id;
        try {
            await client.connect();
            const db = client.db("awidatabase");
            const typeJeuCollection = db.collection("typeJeux");

            if (!ObjectId.isValid(id)) {
                return res.status(404).json({ message: 'Type de jeu non trouvé.' });
            }

            const typeJeu = await typeJeuCollection.findOne({ _id: new ObjectId(id) }, { projection: { _id: 0, intitule: 1, editeur: 1 } });
            if (!typeJeu) {
                return res.status(404).json({ message: 'Type de jeu non trouvé.' });
            }

            res.status(200).json(typeJeu);
        } catch (error) {
            console.error(`Erreur lors de la récupération du type de jeu avec l'ID ${id}:`, error);
            res.status(500).json({ message: 'Erreur lors de la récupération du type de jeu.' });
        } finally {
            await client.close();
        }
    }

    static async getAllTypeJeux(req, res) {
        try {
            await client.connect();
            const db = client.db("awidatabase");
            const typeJeuCollection = db.collection("typeJeux");

            const typeJeux = await typeJeuCollection
                .find({}, { projection: { _id: 0, intitule: 1, editeur: 1 } })
                .toArray();

            res.status(200).json(typeJeux);
        } catch (error) {
            console.error('Erreur lors de la récupération des types de jeux:', error);
            res.status(500).json({ message: 'Erreur lors de la récupération des types de jeux.' });
        } finally {
            await client.close();
        }
    }

    static async updateTypeJeu(req, res) {
        const id = req.params.id;
        try {
            await client.connect();
            const db = client.db("awidatabase");
            const typeJeuCollection = db.collection("typeJeux");

            if (!ObjectId.isValid(id)) {
                return res.status(404).json({ message: 'Type de jeu non trouvé.' });
            }

            const { intitule, editeur } = req.body;

            if (!intitule || !editeur) {
                return res.status(400).json({ message: 'Les champs intitulé et éditeur sont requis.' });
            }

            const existingTypeJeu = await typeJeuCollection.findOne({ intitule, _id: { $ne: new ObjectId(id) } });
            if (existingTypeJeu) {
                return res.status(400).json({ message: 'Cet intitulé est déjà utilisé par un autre type de jeu.' });
            }

            const updatedTypeJeu = {
                $set: {
                    intitule,
                    editeur,
                    updatedAt: new Date(),
                },
            };

            const result = await typeJeuCollection.updateOne({ _id: new ObjectId(id) }, updatedTypeJeu);

            if (result.matchedCount === 0) {
                return res.status(404).json({ message: 'Type de jeu non trouvé.' });
            }

            res.status(200).json({ message: 'Type de jeu mis à jour avec succès.' });
        } catch (error) {
            console.error('Erreur lors de la mise à jour du type de jeu:', error);
            res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du type de jeu.' });
        } finally {
            await client.close();
        }
    }

    static async deleteTypeJeu(req, res) {
        const id = req.params.id;
        try {
            await client.connect();
            const db = client.db("awidatabase");
            const typeJeuCollection = db.collection("typeJeux");

            if (!ObjectId.isValid(id)) {
                return res.status(404).json({ message: 'Type de jeu non trouvé.' });
            }

            const result = await typeJeuCollection.deleteOne({ _id: new ObjectId(id) });

            if (result.deletedCount === 0) {
                return res.status(404).json({ message: 'Type de jeu non trouvé.' });
            }

            res.status(200).json({ message: 'Type de jeu supprimé avec succès.' });
        } catch (error) {
            console.error(`Erreur lors de la suppression du type de jeu avec l'ID ${id}:`, error);
            res.status(500).json({ message: 'Erreur lors de la suppression du type de jeu.' });
        } finally {
            await client.close();
        }
    }
}

module.exports = TypeJeuController;
