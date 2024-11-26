const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://lisandrebegon1:czbssegw5de6kicv@awidatabase.1z4go.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

class CategorieController {
    static async createCategorie(req, res) {
        try {
            // Connect to MongoDB
            await client.connect();
            const db = client.db("awidatabase"); // Use your database name
            const categoriesCollection = db.collection("categories"); // Use your collection name

            const { name } = req.body;

            // Validation: Check if the category name is provided
            if (!name) {
                return res.status(400).json({ message: "Le nom de la catégorie est requis." });
            }

            // Check if the category already exists
            const existingCategorie = await categoriesCollection.findOne({ name });
            if (existingCategorie) {
                return res.status(400).json({ message: "Cette catégorie existe déjà." });
            }

            // Create a new category document
            const newCategorie = {
                name,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // Insert the new category into the collection
            const result = await categoriesCollection.insertOne(newCategorie);

            // Respond with the created category
            res.status(201).json({
                message: "Catégorie créée avec succès.",
            });
        } catch (error) {
            console.error("Erreur lors de la création de la catégorie :", error);
            res.status(500).json({ message: "Erreur serveur lors de la création de la catégorie." });
        } finally {
            // Ensure the MongoDB client is closed
            await client.close();
        }
    }
}

module.exports = CategorieController;
