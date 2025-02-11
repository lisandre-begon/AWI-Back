const express = require('express');
const router = express.Router();
const jeuController = require('../controllers/jeuController');

router.post('/', jeuController.createJeu);
router.get('/', jeuController.getAllJeux);
router.get('/id/:id', jeuController.getJeuById);
router.post('/filtered', jeuController.getFilteredJeux);
router.get('/vendeur/:vendeurId', jeuController.getJeuxByVendeur);
router.delete('/:id', jeuController.deleteJeu);

module.exports = router;
