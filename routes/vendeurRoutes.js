const express = require('express');
const router = express.Router();
const vendeurController = require('../controllers/vendeurController');

router.post('/', vendeurController.createVendeur);

module.exports = router;
