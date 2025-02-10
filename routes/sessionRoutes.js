const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

router.post('/', sessionController.createSession);
router.get('/', sessionController.getAllSession);
router.get('/encours', sessionController.getSessionEnCours);
router.get('/nextsession', sessionController.getNextPlannedSession);
router.get('/planified', sessionController.getSessionPlanifiee);
router.get('/activeSession', sessionController.isSessionActive);

module.exports = router;
