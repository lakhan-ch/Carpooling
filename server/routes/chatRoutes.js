const express = require('express');
const router = express.Router();
const chatController = require('../controllers/ChatController');
const { requireAuth } = require('../middleware/auth');

router.get('/:rideId', requireAuth, chatController.getMessages);
router.post('/:rideId', requireAuth, chatController.sendMessage);

module.exports = router;
