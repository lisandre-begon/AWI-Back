const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

router.post('/', sessionController.createSession);
router.get('/', sessionController.getAllSession);
router.get('/encours', sessionController.getSessionEnCours);
router.get('/nextsession', sessionController.getNextPlannedSession);
router.get('/planifed', sessionController.getSessionPlanifiee);
router.get('/activeSession', sessionController.isActive);

module.exports = router;