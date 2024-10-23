const express = require('express');
const router = express.Router();
const vendeurController = require('../controllers/vendeurController');

router.post('/', vendeurController.createVendeur);
router.get('/', vendeurController.getAllVendeurs);
router.get('/:id', vendeurController.getVendeurById);
router.put('/:id', vendeurController.updateVendeur);
router.delete('/:id', vendeurController.deleteVendeur);

module.exports = router;
