const Vendeur = require('../models/vendeurModels');

async function createVendeur(req, res) {
  try {

    const allowedFields = ['nom', 'prenom', 'email', 'telephone'];
    //On va d'abord vérifier la validité de tous les champs
    const bodyFields = Object.keys(req.body);

    // Vérifier si tous les champs dans req.body sont autorisés
    const hasInvalidFields = bodyFields.some(field => !allowedFields.includes(field));

    if (hasInvalidFields) {
        return res.status(400).json({ error: 'Le corps de la requête contient des champs non autorisés.' });
    }

    //les champs sont valides on peut passer à la vérification des valeurs
    const { nom, prenom, email, telephone } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nom) return res.status(400).json({ message: 'Le nom est requis.' });
    if (!prenom) return res.status(400).json({ message: 'Le prénom est requis.' });
    if (!email) return res.status(400).json({ message: 'L\'email est requis.' });
    // Vérification si l'email est valide
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'L\'email fourni n\'est pas valide.' });
    }
    
    if (!telephone) return res.status(400).json({ message: 'Le numéro de téléphone est requis.' });

    return res.status(201).json({ message: 'Vendeur créé avec succès.', vendeur: req.body });

    /*
    // Création du vendeur
    const vendeur = await Vendeur.create({ nom, prenom, email, telephone });
    res.status(201).json(vendeur);*/

  } catch (error) {
    console.error('Erreur lors de la création du vendeur:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création du vendeur.' });
  }
}

module.exports = { createVendeur };
