const express = require('express');
const router = express.Router();
const vendeurController = require('../controllers/vendeurController');

router.post('/', vendeurController.createVendeur);
router.get('/:id', vendeurController.getVendeurById);
router.get('/', vendeurController.getAllVendeurs);
router.put('/:id', vendeurController.updateVendeur);
router.put('/solde/:id', vendeurController.resetSolde);
router.delete('/:id', vendeurController.deleteVendeur);

module.exports = router;
