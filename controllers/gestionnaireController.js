const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');


const uri = "mongodb+srv://lisandrebegon1:czbssegw5de6kicv@awidatabase.1z4go.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);
const connectToDatabase = require('../config/database');
const SECRET_KEY = process.env.SECRET;

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

            const hash_mot_de_passe = await bcrypt.hash(mot_de_passe, 10);

            const newGestionnaire = {
                pseudo,
                mot_de_passe : hash_mot_de_passe,
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

    // Connexion d'un gestionnaire
    static async login(req, res){
        try {
            const db = await connectToDatabase();
            const gestionnairesCollection = db.collection("gestionnaires");
            const { pseudo, mot_de_passe } = req.body;
            console.log(pseudo);
            const gestionnaire = await gestionnairesCollection.findOne({ pseudo : pseudo });
            console.log(gestionnaire);
        if (!gestionnaire) {
            return res.status(401).json({ message: 'Utilisateur incorrect' });
        }
        console.log("yes")
        console.log(mot_de_passe)
        console.log( gestionnaire.mot_de_passe)
        const isMatch = await bcrypt.compare(mot_de_passe, gestionnaire.mot_de_passe);
        console.log(isMatch);
        if (!isMatch) {
            return res.status(401).json({ message: 'mot de passe incorrect' });
        }

        console.log("Clé secrète :", SECRET_KEY);

        const token = jwt.sign({ id: gestionnaire._id, pseudo: gestionnaire.pseudo }, SECRET_KEY, { expiresIn: '1h' });
        console.log(token);
        res.status(200).json({ message: 'Connexion réussie', token });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

//Déconnexion d'un gestionnaire
static async logout(req, res){
    try {
        const db = await connectToDatabase();
        const gestionnairesCollection = db.collection("gestionnaires");

        const { pseudo } = req.body;
        const gestionnaire = await gestionnairesCollection
            .findOne({ pseudo })
            .then((gestionnaire) => {
                if (!gestionnaire) {
                    return res.status(401).json({ message: 'Utilisateur non trouvé' });
                }
                res.status(200).json({ message: 'Déconnexion réussie' });
            });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    } 
  }

// Accès à la route admin protégée
static async getGestPage(req, res) {
    res.status(200).json({ message: 'Bienvenue sur la route admin sécurisée !' }); 
};

}


module.exports = GestionnaireController;
