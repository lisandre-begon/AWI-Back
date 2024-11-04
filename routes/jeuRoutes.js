const express = require('express');
const router = express.Router();
const jeuController = require('../controllers/jeuController');

router.post('/', jeuController.createJeu);

module.exports = router;
