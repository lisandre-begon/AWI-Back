const express = require('express');
const router = express.Router();
const typeJeuController = require('../controllers/typeJeuController');

router.post('/', typeJeuController.createTypeJeu);
router.get('/:id', typeJeuController.getTypeJeuById);
router.get('/', typeJeuController.getAllTypeJeux);
router.put('/:id', typeJeuController.updateTypeJeu);
router.delete('/:id', typeJeuController.deleteTypeJeu);

module.exports = router;
