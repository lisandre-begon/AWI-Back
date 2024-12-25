const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb+srv://lisandrebegon1:czbssegw5de6kicv@awidatabase.1z4go.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

class JeuController {
    static async createJeu(req, res) {
        try {
            await client.connect();
            const db = client.db("awidatabase");
            const jeuxCollection = db.collection("jeux");
            const vendeursCollection = db.collection("vendeurs");
            const categoriesCollection = db.collection("categories");

            const { etiquette, vendeurId, intitule, editeur, prix, categories } = req.body;

            if (!vendeurId) return res.status(400).json({ message: 'L\'ID du vendeur est requis.' });
            if (!intitule) return res.status(400).json({ message: 'L\'intitulé est requis.' });
            if (!editeur) return res.status(400).json({ message: 'L\'éditeur est requis.' });
            if (!prix || prix <= 0) return res.status(400).json({ message: 'Un prix valide est requis.' });
            if (!categories || categories.length === 0) {
                return res.status(400).json({ message: 'Au moins une catégorie est requise.' });
            }

            /*
            const existingJeu = await jeuxCollection.findOne({ etiquette });
            if (existingJeu) {
                return res.status(400).json({ message: 'Un jeu avec cette étiquette existe déjà.' });
            } */

            // Validation du vendeur
            const vendeurExists = await vendeursCollection.findOne({ _id: new ObjectId(vendeurId) });
            if (!vendeurExists) {
                return res.status(404).json({ message: 'Le vendeur spécifié n\'existe pas.' });
            }

            // Validation des catégories
            const invalidCategories = [];
            for (const categoryId of categories) {
                const categoryExists = await categoriesCollection.findOne({ _id: new ObjectId(categoryId) });
                if (!categoryExists) invalidCategories.push(categoryId);
            }
            if (invalidCategories.length > 0) {
                return res.status(404).json({
                    message: `Les catégories suivantes n'existent pas : ${invalidCategories.join(', ')}`,
                });
            }

            const newJeu = {
                vendeurId: new ObjectId(vendeurId),
                intitule,
                editeur,
                prix: parseFloat(prix),
                categories: categories.map(id => new ObjectId(id)),
                createdAt: new Date(),
            };

            await jeuxCollection.insertOne(newJeu);

            res.status(201).json({ message: 'Jeu créé avec succès.' });
        } catch (error) {
            console.error('Erreur lors de la création du jeu:', error);
            res.status(500).json({ message: 'Erreur serveur lors de la création du jeu.' });
        } finally {
            await client.close();
        }
    }

    static async getJeuById(req, res) {
        const id = req.params.id;
        try {
            await client.connect();
            const db = client.db("awidatabase");
            const jeuxCollection = db.collection("jeux");
            const vendeursCollection = db.collection("vendeurs");
            const categoriesCollection = db.collection("categories");
    
            if (!ObjectId.isValid(id)) {
                return res.status(404).json({ message: 'Jeu non trouvé.' });
            }
    
            const jeu = await jeuxCollection.findOne({ _id: new ObjectId(id) });
    
            if (!jeu) {
                return res.status(404).json({ message: 'Jeu non trouvé.' });
            }
    
            // Fetch vendeurs and categories to map their names
            const vendeurs = await vendeursCollection.find().toArray();
            const categories = await categoriesCollection.find().toArray();
    
            const vendeursMap = vendeurs.reduce((map, vendeur) => {
                map[vendeur._id.toString()] = vendeur.nom;
                return map;
            }, {});
    
            const categoriesMap = categories.reduce((map, category) => {
                map[category._id.toString()] = category.name;
                return map;
            }, {});
    
            const jeuWithDetails = {
                etiquette: jeu._id,
                vendeur: vendeursMap[jeu.vendeurId?.toString()], // Map vendeur ID to name
                intitule: jeu.intitule,
                editeur: jeu.editeur,
                prix: jeu.prix,
                categories: jeu.categories?.map(catId => categoriesMap[catId?.toString()]), // Replace category IDs with names
                createdAt: jeu.createdAt,
            };
    
            res.status(200).json(jeuWithDetails);
        } catch (error) {
            console.error(`Erreur lors de la récupération du jeu avec l'ID ${id}:`, error);
            res.status(500).json({ message: 'Erreur lors de la récupération du jeu.' });
        } finally {
            await client.close();
        }
    }
    
    static async getJeuxByVendeur(req, res) {
        const vendeurId = req.params.vendeurId;
        try {
            await client.connect();
            const db = client.db("awidatabase");
            const jeuxCollection = db.collection("jeux");
            const vendeursCollection = db.collection("vendeurs");
            const categoriesCollection = db.collection("categories");
    
            if (!ObjectId.isValid(vendeurId)) {
                return res.status(404).json({ message: 'Vendeur non trouvé.' });
            }
    
            const jeux = await jeuxCollection.find({ vendeurId: new ObjectId(vendeurId) }).toArray();
    
            if (jeux.length === 0) {
                return res.status(404).json({ message: 'Aucun jeu trouvé pour ce vendeur.' });
            }
    
            // Fetch vendeurs and categories to map their names
            const vendeurs = await vendeursCollection.find().toArray();
            const categories = await categoriesCollection.find().toArray();
    
            const vendeursMap = vendeurs.reduce((map, vendeur) => {
                map[vendeur._id.toString()] = vendeur.nom;
                return map;
            }, {});
    
            const categoriesMap = categories.reduce((map, category) => {
                map[category._id.toString()] = category.name;
                return map;
            }, {});
    
            const jeuxWithDetails = jeux.map(jeu => ({
                etiquette: jeu._id,
                vendeur: vendeursMap[jeu.vendeurId?.toString()], // Map vendeur ID to name
                intitule: jeu.intitule,
                editeur: jeu.editeur,
                prix: jeu.prix,
                categories: jeu.categories?.map(catId => categoriesMap[catId?.toString()]), // Replace category IDs with names
                createdAt: jeu.createdAt,
            }));
    
            res.status(200).json(jeuxWithDetails);
        } catch (error) {
            console.error(`Erreur lors de la récupération des jeux pour le vendeur avec l'ID ${vendeurId}:`, error);
            res.status(500).json({ message: 'Erreur lors de la récupération des jeux du vendeur.' });
        } finally {
            await client.close();
        }
    }
    

    static async getAllJeux(req, res) {
        try {
            await client.connect();
            const db = client.db("awidatabase");
    
            const jeuxCollection = db.collection("jeux");
            const vendeursCollection = db.collection("vendeurs");
            const categoriesCollection = db.collection("categories");
    
            const jeux = await jeuxCollection.find().toArray();
    
            const vendeurs = await vendeursCollection.find().toArray();
            const categories = await categoriesCollection.find().toArray();
    
            const vendeursMap = vendeurs.reduce((map, vendeur) => {
                map[vendeur._id.toString()] = vendeur.nom;
                return map;
            }, {});
    
            const categoriesMap = categories.reduce((map, category) => {
                map[category._id.toString()] = category.name; // Map category ID to name
                return map;
            }, {});
    
            // Map over games to replace IDs with names
            const jeuxWithDetails = jeux.map(jeu => ({
                etiquette: jeu._id,
                vendeur: vendeursMap[jeu.vendeurId?.toString()], // Get vendeur name from map
                intitule: jeu.intitule,
                editeur: jeu.editeur,
                prix: jeu.prix,
                categories: jeu.categories?.map(catId => categoriesMap[catId?.toString()]), // Replace category IDs with names
                createdAt: jeu.createdAt
            }));
    
            res.status(200).json(jeuxWithDetails);
        } catch (error) {
            console.error('Erreur lors de la récupération des jeux:', error);
            res.status(500).json({ message: 'Erreur lors de la récupération des jeux.' });
        } finally {
            await client.close();
        }
    }
    
    static async updateJeu(req, res) {
        const id = req.params.id;
        try {
            await client.connect();
            const db = client.db("awidatabase");
            const jeuxCollection = db.collection("jeux");
            const vendeursCollection = db.collection("vendeurs");
            const categoriesCollection = db.collection("categories");
    
            if (!ObjectId.isValid(id)) {
                return res.status(404).json({ message: 'Jeu non trouvé.' });
            }
    
            const { vendeurId, categories, dateVente, intitule, editeur, prix } = req.body;
    
            // Validation du vendeur
            if (vendeurId) {
                const vendeurExists = await vendeursCollection.findOne({ _id: new ObjectId(vendeurId) });
                if (!vendeurExists) {
                    return res.status(404).json({ message: 'Le vendeur spécifié n\'existe pas.' });
                }
            }
    
            // Validation des catégories
            if (categories && categories.length > 0) {
                const invalidCategories = [];
                for (const categoryId of categories) {
                    const categoryExists = await categoriesCollection.findOne({ _id: new ObjectId(categoryId) });
                    if (!categoryExists) invalidCategories.push(categoryId);
                }
                if (invalidCategories.length > 0) {
                    return res.status(404).json({
                        message: `Les catégories suivantes n'existent pas : ${invalidCategories.join(', ')}`,
                    });
                }
            }
    
            const updateFields = {
                ...(vendeurId && { vendeurId: new ObjectId(vendeurId) }),
                ...(categories && { categories: categories.map(id => new ObjectId(id)) }),
                ...(dateVente && { dateVente: new Date(dateVente) }),
                ...(intitule && { intitule }),
                ...(editeur && { editeur }),
                ...(prix && { prix }),
                updatedAt: new Date()
            };
    
            const result = await jeuxCollection.updateOne({ _id: new ObjectId(id) }, { $set: updateFields });
    
            if (result.matchedCount === 0) {
                return res.status(404).json({ message: 'Jeu non trouvé.' });
            }
    
            res.status(200).json({ message: 'Jeu mis à jour avec succès.' });
        } catch (error) {
            console.error('Erreur lors de la mise à jour du jeu:', error);
            res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du jeu.' });
        } finally {
            await client.close();
        }
    }
    
    static async deleteJeu(req, res) {
        const id = req.params.id;
        try {
            await client.connect();
            const db = client.db("awidatabase");
            const jeuxCollection = db.collection("jeux");
    
            if (!ObjectId.isValid(id)) {
                return res.status(404).json({ message: 'Jeu non trouvé.' });
            }
    
            const result = await jeuxCollection.deleteOne({ _id: new ObjectId(id) });
    
            if (result.deletedCount === 0) {
                return res.status(404).json({ message: 'Jeu non trouvé.' });
            }
    
            res.status(200).json({ message: 'Jeu supprimé avec succès.' });
        } catch (error) {
            console.error(`Erreur lors de la suppression du jeu avec l'ID ${id}:`, error);
            res.status(500).json({ message: 'Erreur lors de la suppression du jeu.' });
        } finally {
            await client.close();
        }
    }    
}

module.exports = JeuController;
