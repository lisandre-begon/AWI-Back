
const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb+srv://lisandrebegon1:czbssegw5de6kicv@awidatabase.1z4go.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);
const connectToDatabase = require('../config/database');


class SessionController {

    static async createSession(req, res){
        try{
            const db = await connectToDatabase();
            const sessionCollection = db.collection("session");
    
            const { dateDebut, dateFin, fraisDepot, statutSession } = req.body;
    
            if (!dateDebut) return res.status(400).json({ message: 'Une date de debut est requise.' });
            if (!dateFin) return res.status(400).json({ message: 'Une date de fin est requise.' });
            if (!fraisDepot) return res.status(400).json({ message: 'Des frais de depots sont requis.' });
            if (!statutSession) return res.status(400).json({ message: 'Un statut est requis.' });
    
            if (dateDebut > dateFin) {
                return res.status(400).json({ message: 'La date de debut est après la date de fin' });
            }
    
            const newSession = { dateDebut, dateFin, fraisDepot, statutSession };
    
            await sessionCollection.insertOne(newSession);
            res.status(201).json({ message: 'Session créée avec succès.' });
        } catch(error) {
            console.error('Erreur lors de la création de la session', error);
            res.status(500).json({ message: 'Erreur serveur lors de la création de la session.' });
        }
    }
    
    static async getSessionEnCours(req, res){
        try{
            const db = await connectToDatabase();
            const sessionCollection = db.collection("session");
    
            const session = await sessionCollection.findOne({ statut: "En cours" });
            if (!session) {
                return res.status(404).json({ message: 'Pas de session en cours' });
            }
    
            res.status(200).json(session);
        } catch (error) {
            console.error(`Erreur lors de la récupération de la session en cours`, error);
            res.status(500).json({ message: 'Erreur lors de la récupération de la session' });
        }
    }
    
    static async getSessionPlanifiee(req, res){
        try{
            await client.connect();
            const db = client.db("awidatabase");
            const sessionCollection = db.collection("Session");

            const session = await sessionCollection.findOne({statut: "Planifiée"}).toArray();
            if (!session) {
                return res.status(404).json({ message: 'Pas de session planifie' });
            }

            res.status(200).json(session);
        } catch (error) {
            console.error(`Erreur lors de la récupération de la session planifie`, error);
            res.status(500).json({ message: 'Erreur lors de la récupération de la session' });
        } finally {
            await client.close();
        }
    }

    static async getNextPlannedSession (req, res){
        try{
            await client.connect();
            const db = client.db("awidatabase");
            const sessionCollection = db.collection("Session");

            const session = await sessionCollection.findOne({statut: "Planifiée"}).toArray();
            if (!session) {
                return res.status(404).json({ message: 'Pas de session planifie' });
            }

            res.status(200).json(session);
        } catch (error) {
            console.error(`Erreur lors de la récupération de la session planifie`, error);
            res.status(500).json({ message: 'Erreur lors de la récupération de la session' });
        } finally {
            await client.close();
        }
    }

    static async getAllSession(req, res){
        try {
            await client.connect();
            const db = client.db("awidatabase");
            const sessionCollection = db.collection("session");

            const session = await sessionCollection
                .find().toArray();

            res.status(200).json(session);
        } catch (error) {
            console.error('Erreur lors de la récupération des sessions:', error);
            res.status(500).json({ message: 'Erreur lors de la récupération des sessions.' });
        } finally {
            await client.close();
        }
    }


    static async isSessionActive (req, res){
        try{
            await client.connect();
            const db = client.db("awidatabase");
            const sessionCollection = db.collection("session");

            const session = await sessionCollection.findOne({statut: "En cours"}).toArray();
            if(activeSession) {
                return res.status(200).json({isActive: true});
            }else {
                return res.status(200).json({isActive : false});       
            }
        }catch{
            res.status(400).json({ error });
        }
    }
}


module.exports = SessionController;