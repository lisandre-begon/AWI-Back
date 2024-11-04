const Jeu = require('../models/jeu/jeuModels');
const Categorie = require('../models/jeu/categorieModels');

const categoriePrefaites = [
  { id: 1, nom: 'Action' },
  { id: 2, nom: 'Aventure' },
  { id: 3, nom: 'Simulation' },
  { id: 4, nom: 'Stratégie' },
  { id: 5, nom: 'RPG' },
  { id: 6, nom: 'Sport' },
  { id: 7, nom: 'Puzzle' },
  { id: 8, nom: 'Horreur' },
  { id: 9, nom: 'Plateforme' },
  { id: 10, nom: 'Course' },
  { id: 11, nom: 'FPS' },
  { id: 12, nom: 'TPS' },
  { id: 13, nom: 'MMO' },
  { id: 14, nom: 'Survie' },
  { id: 15, nom: 'Battle Royale' },
  { id: 16, nom: 'Rogue-like' },
  { id: 17, nom: 'Beat\'em all' },
  { id: 18, nom: 'Musical' },
  { id: 19, nom: 'Party Game' },
  { id: 20, nom: 'Visual Novel' },
  { id: 21, nom: 'Metroidvania' },
  { id: 22, nom: 'Hack\'n Slash' },
  { id: 23, nom: 'City Builder' },
  { id: 24, nom: 'Sandbox' },
  { id: 25, nom: 'Rythme' },
  { id: 26, nom: 'Tactical RPG' },
  { id: 27, nom: 'MMORPG' },
  { id: 28, nom: 'MOBA' },
  { id: 29, nom: 'Tower Defense' },
  { id: 30, nom: 'Visual Novel' },
  { id: 31, nom: 'Jeu de cartes' },
  { id: 32, nom: 'Jeu de société' },
  { id: 33, nom: 'Jeu de rôle' },
  { id: 34, nom: 'Jeu de stratégie' },
  { id: 35, nom: 'Jeu de tir' },
];

async function createJeu(req, res) {
  try {

    const allowedFields = ['intitule', 'editeur', 'prix', 'categories', 'statut'];
    //On va d'abord vérifier la validité de tous les champs
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
    }else if (!categories.every(cat => categoriePrefaites.some(prefCat => prefCat.nom === cat))) {
      return res.status(400).json({ message: 'Cette catégorie n\'est pas valide.' });
    }
    if (!statut) {
     statut = 'en vente';
    }else if (!['en vente', 'pas encore en vente', 'vendu'].includes(statut)) {
      return res.status(400).json({ message: 'Le statut doit être "en vente", "pas encore en vente" ou "vendu".' });
    }

    return res.status(201).json({ message: 'Jeu créé avec succès.', jeu: req.body });


    /*
    // Création du jeu avec date initialisée à la date du jour
    const jeu = await Jeu.create({
      intitule,
      editeur,
      prix,
      dateDepot: new Date()
    });

    
    // Vérification et association des catégories
    const categoriesExistantes = await Categorie.findAll({
      where: {
        id: categories
      }
    });

    if (categoriesExistantes.length !== categories.length) {
      return res.status(400).json({ message: 'Certaines catégories spécifiées sont invalides.' });
    }

    await jeu.addCategories(categoriesExistantes);
    */

    res.status(201).json({ message: 'Jeu créé avec succès.', jeu });
  } catch (error) {
    console.error('Erreur lors de la création du jeu :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création du jeu.' });
  }
}

module.exports = { createJeu };
