const express = require('express');
const router = express.Router();
const gestionnaireController = require('../controllers/gestionnaireController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/', gestionnaireController.createGestionnaire);
router.get('/:id', gestionnaireController.getGestionnaireById);
router.get('/', gestionnaireController.getAllGestionnaires);
router.put('/:id', gestionnaireController.updateGestionnaire);
router.delete('/:id', gestionnaireController.deleteGestionnaire);
router.post('/login', gestionnaireController.login);
router.post('/logout', gestionnaireController.logout); 
router.get('/gestionnaire_page', authenticateToken, gestionnaireController.getGestPage);

module.exports = router;
