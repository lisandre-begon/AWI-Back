async function createAcheteur(req, res) {
  try {

    const allowedFields = ['nom', 'prenom', 'email', 'telephone', 'adresse'];
    //On va d'abord vérifier la validité de tous les champs
    const bodyFields = Object.keys(req.body);

    // Vérifier si tous les champs dans req.body sont autorisés
    const hasInvalidFields = bodyFields.some(field => !allowedFields.includes(field));

    if (hasInvalidFields) {
        return res.status(400).json({ error: 'Le corps de la requête contient des champs non autorisés.' });
    }

    const { nom, prenom, email, telephone, adresse } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Vérifications des champs
    if (!nom) return res.status(400).json({ message: 'Le nom est requis.' });
    if (!prenom) return res.status(400).json({ message: 'Le prénom est requis.' });
    if (!email) return res.status(400).json({ message: 'L\'email est requis.' });
    // Vérification si l'email est valide
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'L\'email fourni n\'est pas valide.' });
    }

    if (!telephone) return res.status(400).json({ message: 'Le numéro de téléphone est requis.' });
    if (!adresse) return res.status(400).json({ message: 'L\'adresse est requise.' });


    return res.status(201).json({ message: 'Acheteur créé avec succès.', acheteur: req.body });

    /*
    // Création de l'acheteur
    const acheteur = await Acheteur.create({ nom, prenom, email, telephone, adresse });
    res.status(201).json(acheteur);*/

  } catch (error) {
    console.error('Erreur lors de la création de l\'acheteur:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création de l\'acheteur.' });
  }
}

async function getAcheteurById(id) {
  try {
    const response = await apiClient.get(`/acheteurs/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'acheteur avec l'ID ${id}:`, error);
    return null;
  }
}


module.exports = { createAcheteur, getAcheteurById };