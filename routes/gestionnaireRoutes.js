const express = require('express');
const router = express.Router();
const gestionnaireController = require('../controllers/gestionnaireController');

router.post('/', gestionnaireController.createGestionnaire);
router.get('/', gestionnaireController.getAllGestionnaires);
router.get('/:id', gestionnaireController.getGestionnaireById);
router.put('/:id', gestionnaireController.updateGestionnaire);
router.delete('/:id', gestionnaireController.deleteGestionnaire);

module.exports = router;
