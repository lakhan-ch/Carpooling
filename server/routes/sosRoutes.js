const express = require('express');
const router = express.Router();
const sosController = require('../controllers/SOSController');
const { requireAuth } = require('../middleware/auth');

router.post('/', requireAuth, sosController.triggerSOS);

module.exports = router;
