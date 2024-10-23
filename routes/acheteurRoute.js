const express = require('express');
const router = express.Router();
const acheteurController = require('../controllers/acheteurController');

router.post('/', acheteurController.createAcheteur);
router.get('/', acheteurController.getAllAcheteurs);
router.get('/:id', acheteurController.getAcheteurById);
router.put('/:id', acheteurController.updateAcheteur);
router.delete('/:id', acheteurController.deleteAcheteur);

module.exports = router;
