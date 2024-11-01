const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

router.get('/transaction', transactionController.getTransactions); //Fonction pour le traitement des Transactions filtrées ou pas

module.exports = router;
