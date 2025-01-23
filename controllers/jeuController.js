const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb+srv://lisandrebegon1:czbssegw5de6kicv@awidatabase.1z4go.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);
const connectToDatabase = require('../config/database');

class JeuController {
    static async createJeu(req, res) {
        try {
            await client.connect();
            const db = client.db("awidatabase");
            const jeuxCollection = db.collection("jeux");
            const typeJeuxCollection = db.collection("typeJeux");
            const vendeursCollection = db.collection("vendeurs");
            const categoriesCollection = db.collection("categories");

            const { vendeurId, typeJeuId, prix, categories, quantites, statut } = req.body;

            if (!vendeurId) return res.status(400).json({ message: 'L\'ID du vendeur est requis.' });
            if (!prix || prix <= 0) return res.status(400).json({ message: 'Un prix valide est requis.' });
            if (!categories || categories.length === 0) {
                return res.status(400).json({ message: 'Au moins une catégorie est requise.' });
            }
            if (!typeJeuId) return res.status(400).json({ message: 'L\'ID du type de jeu est requis.' });
            if (statut && !['pas disponible', 'disponible', 'vendu'].includes(statut)) {
                return res.status(400).json({ message: 'Statut invalide.' });
            }
            if (quantites <= 0) return res.status(400).json({ message: 'Une quantité valide est requise.' });

            // Validation du vendeur
            const vendeurExists = await vendeursCollection.findOne({ _id: new ObjectId(vendeurId) });
            if (!vendeurExists) {
                return res.status(404).json({ message: 'Le vendeur spécifié n\'existe pas.' });
            }

            const typeJeuExists = await typeJeuxCollection.findOne({ _id: new ObjectId(typeJeuId) });
            if (!typeJeuExists) {
                return res.status(404).json({ message: 'Le type de jeu spécifié n\'existe pas.' });
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

            //Cas où le jeu est déjà en vente par le même vendeur
            const jeuEnVente = await jeuxCollection.findOne({ vendeurId: new ObjectId(vendeurId), typeJeuId: new ObjectId(typeJeuId) });
            const newJeu = {
                vendeurId: new ObjectId(vendeurId),
                typeJeuId: new ObjectId(typeJeuId),
                statut: statut || 'disponible',
                prix: parseFloat(prix),
                quantites: parseInt(quantites) || 1,
                categories: categories.map(id => new ObjectId(id)),
                createdAt: new Date(),
            };
            if (jeuEnVente && jeuEnVente.statut === 'disponible') {
                //On rajoute juste la quantité a la quantité du jeu existant
                const newQuantite = jeuEnVente.quantites + parseInt(quantites);
                await jeuxCollection.updateOne({ _id: jeuEnVente._id }, { $set: { quantites: newQuantite } });
                return res.status(201).json({ message: 'Quantité du jeu mise à jour avec succès.', jeu: newJeu });
            } else {
                await jeuxCollection.insertOne(newJeu);
            }

            res.status(201).json({ message: 'Jeu créé avec succès.' });
        } catch (error) {
            console.error('Erreur lors de la création du jeu:', error);
            res.status(500).json({ message: 'Erreur serveur lors de la création du jeu.' });
        } finally {
            await client.close();
        }
    }

    static async getJeuById(req, res) {
        try {
            const id = req.params.id;
            const db = await connectToDatabase();
            const jeuxCollection = db.collection("jeux");
            const typeJeuxCollection = db.collection("typeJeux");
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
            const typeJeux = await typeJeuxCollection.find().toArray();
    
            const vendeursMap = vendeurs.reduce((map, vendeur) => {
                map[vendeur._id.toString()] = vendeur.nom;
                return map;
            }, {});
    
            const categoriesMap = categories.reduce((map, category) => {
                map[category._id.toString()] = category.name;
                return map;
            }, {});

            //Pour obtenir l'intitule et l'éditeur
            const typeJeuxMap = typeJeux.reduce((map, typeJeu) => {
                map[typeJeu._id.toString()] = { intitule: typeJeu.intitule, editeur: typeJeu.editeur };
                return map;
            }, {});

    
            const jeuWithDetails = {
                etiquette: jeu._id,
                vendeur: vendeursMap[jeu.vendeurId?.toString()], // Map vendeur ID to name
                intitule: typeJeuxMap[jeu.typeJeuId?.toString()].intitule,
                editeur: typeJeuxMap[jeu.typeJeuId?.toString()].editeur,
                prix: jeu.prix,
                statut: jeu.statut,
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
        try {
            const vendeurId = req.params.vendeurId;
            const db = await connectToDatabase();
            const jeuxCollection = db.collection("jeux");
            const vendeursCollection = db.collection("vendeurs");
            const categoriesCollection = db.collection("categories");
            const typeJeuxCollection = db.collection("typeJeux");
    
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
            const typeJeux = await typeJeuxCollection.find().toArray();
    
            const vendeursMap = vendeurs.reduce((map, vendeur) => {
                map[vendeur._id.toString()] = vendeur.nom;
                return map;
            }, {});
    
            const categoriesMap = categories.reduce((map, category) => {
                map[category._id.toString()] = category.name;
                return map;
            }, {});

            const typeJeuxMap = typeJeux.reduce((map, typeJeu) => {
                map[typeJeu._id.toString()] = { intitule: typeJeu.intitule, editeur: typeJeu.editeur };
                return map;
            }, {});
    
            const jeuxWithDetails = jeux.map(jeu => ({
                etiquette: jeu._id,
                vendeur: vendeursMap[jeu.vendeurId?.toString()], // Map vendeur ID to name
                intitule: typeJeuxMap[jeu.typeJeuId?.toString()].intitule,
                editeur: typeJeuxMap[jeu.typeJeuId?.toString()].editeur,
                statut: jeu.statut,
                prix: jeu.prix,
                quantites: jeu.quantites,
                categories: jeu.categories?.map(catId => categoriesMap[catId?.toString()]), // Replace category IDs with names
                dateDepot: jeu.createdAt,
            }));
    
            res.status(200).json(jeuxWithDetails);
        } catch (error) {
            console.error(`Erreur lors de la récupération des jeux pour le vendeur avec l'ID ${vendeurId}:`, error);
            res.status(500).json({ message: 'Erreur lors de la récupération des jeux du vendeur.' });
        } finally {
            await client.close();
        }
    }
    
    static async getFilteredJeux(req, res) {
        try {
            const db = await connectToDatabase();
            const jeuxCollection = db.collection("jeux");
            const vendeursCollection = db.collection("vendeurs");
            const categoriesCollection = db.collection("categories");
            const typeJeuxCollection = db.collection("typeJeux");

            const {
                proprietaire,
                prix_min,
                prix_max,
                categorie,
                nameJeu,
            } = req.query;

            const filters = {};

            // Filter by proprietaire (owner)
            if (proprietaire) {
                if (!ObjectId.isValid(proprietaire)) {
                    return res.status(400).json({ message: 'ID de propriétaire invalide.' });
                }
                filters.vendeurId = new ObjectId(proprietaire);
            }

            // Filter by price range
            if (prix_min !== undefined || prix_max !== undefined) {
                filters.prix = {};
                if (prix_min !== undefined) filters.prix.$gte = parseFloat(prix_min);
                if (prix_max !== undefined) filters.prix.$lte = parseFloat(prix_max);
            }

            // Filter by categorie
            if (categorie) {
                if (!ObjectId.isValid(categorie)) {
                    return res.status(400).json({ message: 'ID de catégorie invalide.' });
                }
                filters.categories = new ObjectId(categorie);
            }

            // Filter by nameJeu
            if (nameJeu) {
                filters.intitule = { $regex: new RegExp(nameJeu, 'i') }; // Case-insensitive regex search
            }

            // If no filters are applied, call getAllJeux
            if (Object.keys(filters).length === 0) {
                return JeuController.getAllJeux(req, res);
            }

            const jeux = await jeuxCollection.find(filters).toArray();

            if (jeux.length === 0) {
                return res.status(404).json({ message: 'Aucun jeu ne correspond aux filtres fournis.' });
            }

            const vendeurs = await vendeursCollection.find().toArray();
            const categories = await categoriesCollection.find().toArray();
            const typeJeux = await typeJeuxCollection.find().toArray();

            const vendeursMap = vendeurs.reduce((map, vendeur) => {
                map[vendeur._id.toString()] = vendeur.nom;
                return map;
            }, {});

            const categoriesMap = categories.reduce((map, categorie) => {
                map[categorie._id.toString()] = categorie.nom;
                return map;
            }, {});

            const typeJeuxMap = typeJeux.reduce((map, typeJeu) => {
                map[typeJeu._id.toString()] = { intitule: typeJeu.intitule, editeur: typeJeu.editeur };
                return map;
            }, {});

            // Map over games to replace IDs with names
            const jeuxWithDetails = jeux.map(jeu => ({
                etiquette: jeu._id,
                vendeur: vendeursMap[jeu.vendeurId?.toString()], // Get vendeur name from map
                intitule: typeJeuxMap[jeu.typeJeuId?.toString()].intitule,
                editeur: typeJeuxMap[jeu.typeJeuId?.toString()].editeur,
                statut: jeu.statut,
                prix: jeu.prix,
                quantites: jeu.quantites,
                categories: jeu.categories?.map(catId => categoriesMap[catId?.toString()]), // Replace category IDs with names
                dateDepot: jeu.createdAt
            }));

            res.status(200).json(jeuxWithDetails);
        } catch (error) {
            console.error('Erreur lors de la récupération des jeux filtrés:', error);
            res.status(500).json({ message: 'Erreur serveur lors de la récupération des jeux filtrés.' });
        } finally {
            await client.close();
        }
    }

    static async getAllJeux(req, res) {
        try {
            const db = await connectToDatabase();
            const jeuxCollection = db.collection("jeux");
            const vendeursCollection = db.collection("vendeurs");
            const categoriesCollection = db.collection("categories");
            const typeJeuxCollection = db.collection("typeJeux");

            const jeux = await jeuxCollection.find().toArray();
            const vendeurs = await vendeursCollection.find().toArray();
            const categories = await categoriesCollection.find().toArray();
            const typeJeux = await typeJeuxCollection.find().toArray();

            const vendeursMap = vendeurs.reduce((map, vendeur) => {
                map[vendeur._id.toString()] = vendeur.nom;
                return map;
            }, {});

            const categoriesMap = categories.reduce((map, categorie) => {
                map[categorie._id.toString()] = categorie.nom;
                return map;
            }, {});

            const typeJeuxMap = typeJeux.reduce((map, typeJeu) => {
                map[typeJeu._id.toString()] = { intitule: typeJeu.intitule, editeur: typeJeu.editeur };
                return map;
            }, {});

            // Map over games to replace IDs with names
            const jeuxWithDetails = jeux.map(jeu => ({
                etiquette: jeu._id,
                vendeur: vendeursMap[jeu.vendeurId?.toString()], // Get vendeur name from map
                intitule: typeJeuxMap[jeu.typeJeuId?.toString()].intitule,
                editeur: typeJeuxMap[jeu.typeJeuId?.toString()].editeur,
                statut: jeu.statut,
                prix: jeu.prix,
                quantites: jeu.quantites,
                categories: jeu.categories?.map(catId => categoriesMap[catId?.toString()]), // Replace category IDs with names
                dateDepot: jeu.createdAt
            }));

            res.status(200).json(jeuxWithDetails);
        } catch (error) {
            console.error('Erreur lors de la récupération des jeux:', error);
            res.status(500).json({ message: 'Erreur serveur lors de la récupération des jeux.' });
        } finally {
            await client.close();
        }
    }

    static async updateJeu(req, res) {
        try {
            const db = await connectToDatabase();
            const jeuxCollection = db.collection("jeux");
            const vendeursCollection = db.collection("vendeurs");
            const categoriesCollection = db.collection("categories");
            const typeJeuxCollection = db.collection("typeJeux");
            const id = req.params.id;
    
            if (!ObjectId.isValid(id)) {
                return res.status(404).json({ message: 'Jeu non trouvé.' });
            }
    
            const { vendeurId, categories, dateVente, statut, prix, quantites, typeJeuId } = req.body;
    
            // Validation of vendeur
            if (vendeurId) {
                const vendeurExists = await vendeursCollection.findOne({ _id: new ObjectId(vendeurId) });
                if (!vendeurExists) {
                    return res.status(404).json({ message: 'Le vendeur spécifié n\'existe pas.' });
                }
            }
    
            // Validation of typeJeuId
            if (typeJeuId) {
                const typeJeuExists = await typeJeuxCollection.findOne({ _id: new ObjectId(typeJeuId) });
                if (!typeJeuExists) {
                    return res.status(404).json({ message: 'Le type de jeu spécifié n\'existe pas.' });
                }
            }
    
            // Validation of categories
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
                ...(typeJeuId && { typeJeuId: new ObjectId(typeJeuId) }),
                ...(categories && { categories: categories.map(id => new ObjectId(id)) }),
                ...(dateVente && { dateVente: new Date(dateVente) }),
                ...(statut && { statut }),
                ...(prix && prix > 0 && { prix: parseFloat(prix) }),
                ...(quantites && quantites > 0 && { quantites: parseInt(quantites) }),
                updatedAt: new Date(),
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
        try {
            const db = await connectToDatabase();
            const id = req.params.id;
            const jeuxCollection = db.collection("jeux");
    
            if (!ObjectId.isValid(id)) {
                return res.status(404).json({ message: 'Jeu non trouvé.' });
            }
    
            const jeu = await jeuxCollection.findOne({ _id: new ObjectId(id) });
            if (!jeu) {
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
