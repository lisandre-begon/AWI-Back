const express = require('express');
const router = express.Router();
const acheteurController = require('../controllers/acheteurController');

router.post('/', acheteurController.createAcheteur);

module.exports = router;
