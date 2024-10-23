const express = require('express');
const router = express.Router();
const jeuController = require('../controllers/jeuController');

router.post('/', jeuController.createJeu);
router.get('/', jeuController.getAllJeux);
router.get('/:id', jeuController.getJeuById);
router.put('/:id', jeuController.updateJeu);
router.delete('/:id', jeuController.deleteJeu);

module.exports = router;
