
const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb+srv://lisandrebegon1:czbssegw5de6kicv@awidatabase.1z4go.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);
const connectToDatabase = require('../config/database');


class SessionController {

    static async createSession(req, res) {
        try {
            const db = await connectToDatabase();
            const sessionCollection = db.collection("session");
    
            const { dateDebut, dateFin, fraisDepot } = req.body;
    
            // Get all existing sessions
            const sessions = await sessionCollection.find().toArray();
    
            if (!dateDebut) return res.status(400).json({ message: 'Une date de debut est requise.' });
            if (!dateFin) return res.status(400).json({ message: 'Une date de fin est requise.' });
            if (!fraisDepot) return res.status(400).json({ message: 'Des frais de depots sont requis.' });
    
            if (dateDebut > dateFin) {
                return res.status(400).json({ message: 'La date de debut est après la date de fin' });
            }
    
            // Check for overlapping sessions
            for (let i = 0; i < sessions.length; i++) {
                if ((dateDebut >= sessions[i].dateDebut && dateDebut <= sessions[i].dateFin) || 
                    (dateFin >= sessions[i].dateDebut && dateFin <= sessions[i].dateFin)) {
                    return res.status(400).json({ message: `Une session est déjà prévue du ${sessions[i].dateDebut} au ${sessions[i].dateFin}` });
                }
            }
    
            // Determine the session status based on the dates
            let statutSession = '';
    
            const currentDate = new Date();
            
            // Normalize the current date (remove the time part)
            const currentDateOnly = new Date(currentDate.toISOString().split('T')[0]);
    
            // Normalize the dateDebut and dateFin (remove the time part)
            const dateDebutOnly = new Date(dateDebut.split('T')[0]);
            const dateFinOnly = new Date(dateFin.split('T')[0]);
    
            // Now compare the dates without time
            if (dateDebutOnly <= currentDateOnly && dateFinOnly >= currentDateOnly) {
                statutSession = "En cours";  // If the session is currently running
            } else if (dateFinOnly < currentDateOnly) {
                statutSession = "Terminé";   // If the session has already ended
            } else if (dateDebutOnly > currentDateOnly) {
                statutSession = "Planifiée"; // If the session is in the future
            }
    
            // If no status has been set, default to "Planifiée"
            if (!statutSession) {
                statutSession = "Planifiée";
            }
    
            const newSession = { dateDebut, dateFin, fraisDepot, statutSession };
    
            // Insert the new session into the database
            await sessionCollection.insertOne(newSession);
            res.status(201).json({ message: 'Session créée avec succès.' });
        } catch (error) {
            console.error('Erreur lors de la création de la session', error);
            res.status(500).json({ message: 'Erreur serveur lors de la création de la session.' });
        }
    }
    
    
    
    
    static async getSessionEnCours(req, res){
        try{
            const db = await connectToDatabase();
            const sessionCollection = db.collection("session");
    
            const session = await sessionCollection.findOne({ statutSession: "En cours" });
            if (!session) {
                return res.status(404).json({ message: 'Pas de session en cours' });
            }
    
            res.status(200).json(session);
        } catch (error) {
            console.error(`Erreur lors de la récupération de la session en cours`, error);
            res.status(500).json({ message: 'Erreur lors de la récupération de la session' });
        }
    }
    
    static async getSessionPlanifiée(req, res){
        try{
            const db = await connectToDatabase();
            const sessionCollection = db.collection("session");

            const session = await sessionCollection.find({ statutSession: "Planifiée" }).toArray();
            if (!session) {
                return res.status(404).json({ message: 'Pas de session planifiée' });
            }

            res.status(200).json(session);
        } catch (error) {
            console.error(`Erreur lors de la récupération des sessions planifiées`, error);
            res.status(500).json({ message: 'Erreur lors de la récupération des sessions' });
        } finally {
            await client.close();
        }
    }

    static async getNextPlannedSession(req, res) {
        try {
            const db = await connectToDatabase();
            const sessionCollection = db.collection("session");
    
            // Find all sessions with status "Planifiée", sorted by dateDebut in ascending order
            const session = await sessionCollection.find({ statutSession: "Planifiée" })
                .sort({ dateDebut: 1 })  // Sort by dateDebut in ascending order
                .limit(1)                // Limit to just the next planned session
                .toArray();              // Convert the result to an array
    
            if (session.length === 0) {
                return res.status(404).json({ message: 'Pas de session planifiée' });
            }
    
            res.status(200).json(session[0]);  // Return the first session (the next planned one)
        } catch (error) {
            console.error(`Erreur lors de la récupération de la session planifiée`, error);
            res.status(500).json({ message: 'Erreur lors de la récupération de la session' });
        }
    }
    

    static async getAllSession(req, res){
        try {
            const db = await connectToDatabase();
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

    static async updateSession(req, res){
        const id = req.params.id;
        try {
            const db = await connectToDatabase();
            const sessionCollection = db.collection("session");

            const { dateDebut, dateFin, fraisDepot } = req.body;

            const session = await sessionCollection.findOne({ _id: new ObjectId(id) });
            if (!session) {
                return res.status(404).json({ message: 'Session non trouvée.' });
            }

            if (!dateDebut || !dateFin || !fraisDepot) {
                return res.status(400).json({ message: 'Tous les champs sont requis.' });
            }

            if (dateDebut > dateFin) {
                return res.status(400).json({ message: 'La date de debut est après la date de fin' });
            }

            let statutSession = '';
            const currentDate = new Date();
            
            // Normalize the current date (remove the time part)
            const currentDateOnly = new Date(currentDate.toISOString().split('T')[0]);
    
            // Normalize the dateDebut and dateFin (remove the time part)
            const dateDebutOnly = new Date(dateDebut.split('T')[0]);
            const dateFinOnly = new Date(dateFin.split('T')[0]);
    
            // Now compare the dates without time
            if (dateDebutOnly <= currentDateOnly && dateFinOnly >= currentDateOnly) {
                statutSession = "En cours";  // If the session is currently running
            } else if (dateFinOnly < currentDateOnly) {
                statutSession = "Terminé";   // If the session has already ended
            } else if (dateDebutOnly > currentDateOnly) {
                statutSession = "Planifiée"; // If the session is in the future
            }
    
            // If no status has been set, default to "Planifiée"
            if (!statutSession) {
                statutSession = "Planifiée";
            }

            const updatedSession = { dateDebut, dateFin, fraisDepot, statutSession };

            await sessionCollection.updateOne({ _id: new ObjectId(id) }, { $set: updatedSession });
            res.status(200).json({ message: 'Session modifiée avec succès.' });
        } catch (error) {
            console.error(`Erreur lors de la modification de la session avec l'ID ${id}:`, error);
            res.status(500).json({ message: 'Erreur lors de la modification de la session.' });
        } finally {
            await client.close();
        }
    }
    

    static async updateStatutSession(req, res) {
        try {
            const db = await connectToDatabase();
            const sessionCollection = db.collection("session");

            // Get all sessions to check if the dateFin has passed
            const sessions = await sessionCollection.find().toArray();

            // Iterate through the sessions and update the ones where dateFin < current date
            for (let i = 0; i < sessions.length; i++) {
                // Ensure the date comparison only considers the date part
                const currentDateOnly = new Date(new Date().toISOString().split('T')[0]); // Remove the time part
                const dateFinOnly = new Date(sessions[i].dateFin.split('T')[0]);  // Remove the time part from dateFin

                // Check if _id is valid before using it
                if (!ObjectId.isValid(sessions[i]._id)) {
                    console.error(`Invalid ObjectId: ${sessions[i]._id}`);
                    continue;  // Skip this session if the _id is invalid
                }

                if (dateFinOnly < currentDateOnly) {
                    await sessionCollection.updateOne(
                        { _id: new ObjectId(sessions[i]._id) }, // This should now work with a valid ObjectId
                        { $set: { statutSession: "Terminé" } }
                    );
                }
            }

            res.status(200).json({ message: 'Statut des sessions mis à jour avec succès.' });

        } catch (error) {
            console.error("Erreur lors de la modification du statut des sessions :", error);
            res.status(500).json({ message: 'Erreur lors de la modification du statut des sessions.' });
        }
    }

    
}


module.exports = SessionController;