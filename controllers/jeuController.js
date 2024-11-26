
const Jeu = require('../models/jeu/jeuModels'); // Import du modèle Jeu
const Categorie = require('../models/jeu/categorieModels'); // Import du modèle Categorie

async function createJeu(req, res) {
  try {
    const allowedFields = ['intitule', 'editeur', 'prix', 'categories', 'statut'];
    const bodyFields = Object.keys(req.body);

    // Vérifier si tous les champs dans req.body sont autorisés
    const hasInvalidFields = bodyFields.some(field => !allowedFields.includes(field));
    if (hasInvalidFields) {
      return res.status(400).json({ error: 'Le corps de la requête contient des champs non autorisés.' });
    }

    const { intitule, editeur, prix, categories, statut } = req.body;

    // Vérification des champs requis
    if (!intitule) {
      return res.status(400).json({ message: "L'intitulé est requis." });
    }
    if (!editeur) {
      return res.status(400).json({ message: "L'éditeur est requis." });
    }
    if (prix === undefined || prix < 0) {
      return res.status(400).json({ message: 'Le prix doit être spécifié et positif.' });
    }
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ message: 'Au moins une catégorie est requise.' });
    }

    // Vérification de l'existence des catégories dans la base de données
    const existingCategories = await Categorie.find({ _id: { $in: categories } });
    if (existingCategories.length !== categories.length) {
      return res.status(400).json({ message: 'Certaines catégories spécifiées sont invalides.' });
    }

    // Vérification et assignation du statut
    let validatedStatut = statut || 'en vente';
    if (!['en vente', 'pas encore en vente', 'vendu'].includes(validatedStatut)) {
      return res.status(400).json({ message: 'Le statut doit être "en vente", "pas encore en vente" ou "vendu".' });
    }

    // Création du jeu avec Mongoose
    const newJeu = new Jeu({
      intitule,
      editeur,
      prix,
      dateDepot: new Date(),
      categories,
      statut: validatedStatut,
    });

    const savedJeu = await newJeu.save();
    res.status(201).json({ message: 'Jeu créé avec succès.', jeu: savedJeu });
  } catch (error) {
    console.error('Erreur lors de la création du jeu :', error);
    res.status(500).json({ message: 'Erreur ssaerveur lors de la création du jeu.' });
  }
}


async function getJeuxByIds(req, res) {
  const ids = req.query.ids; // Les IDs sont passés comme paramètres de requête (e.g., ?ids=1,2,3)
  try {
    if (!ids) {
      return res.status(400).json({ error: 'Veuillez fournir une liste d\'IDs.' });
    }

    const jeux = await Jeu.find({ _id: { $in: ids.split(',') } });
    res.status(200).json(jeux);
  } catch (error) {
    console.error(`Erreur lors de la récupération des jeux avec les IDs ${ids}:`, error);
    res.status(500).json({ error: 'Erreur lors de la récupération des jeux' });
  }
}


async function getCategorieById(req, res) {
  const id = req.params.id;
  try {
    const categorie = await Categorie.findById(id);
    if (!categorie) {
      return res.status(404).json({ message: 'Catégorie introuvable.' });
    }

    res.status(200).json(categorie);
  } catch (error) {
    console.error(`Erreur lors de la récupération de la catégorie avec l'ID ${id}:`, error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la catégorie' });
  }
}


async function getAllCategories(req, res) {
  try {
    const categories = await Categorie.find(); 
    res.status(200).json(categories);
  } catch (error) {
    console.error('Erreur lors de la récupération de toutes les catégories:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des catégories' });
  }
}



module.exports = { createJeu };
