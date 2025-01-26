const express = require('express');
const categorieController = require('../controllers/categorieController');

const router = express.Router();

// Route pour créer une nouvelle catégorie
router.post('/', categorieController.createCategorie);
router.get('/', categorieController.getAllCategories);

module.exports = router;