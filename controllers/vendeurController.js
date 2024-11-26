
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
 
    const newVendeur = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!newVendeur.nom) return res.status(400).json({ message: 'Le nom est requis.' });
    if (!newVendeur.prenom) return res.status(400).json({ message: 'Le prénom est requis.' });
    if (!newVendeur.email) return res.status(400).json({ message: 'L\'email est requis.' });
    if (!emailRegex.test(newVendeur.email)) {
      return res.status(400).json({ message: 'L\'email fourni n\'est pas valide.' });
    }
    if (!newVendeur.telephone) return res.status(400).json({ message: 'Le numéro de téléphone est requis.' });

    const response = await apiClient.post('/vendeurs', newVendeur);
    res.status(201).json(response.data);
  
  } catch (error) {
    console.error('Erreur lors de la création du vendeur:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création du vendeur.' });
  }
}



async function getVendeurById(req, res) {
  const id = req.params.id;
  try {
    const response = await apiClient.get(`/vendeurs/${id}`);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(`Erreur lors de la récupération du vendeur avec l'ID ${id}:`, error);
    res.status(500).json({ error: 'Erreur lors de la récupération du vendeur' });
  }
}


module.exports = { createVendeur };
