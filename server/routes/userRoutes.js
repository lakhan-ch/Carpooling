const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const { requireAuth } = require('../middleware/auth');

router.get('/me', requireAuth, userController.getProfile);
router.put('/me', requireAuth, userController.updateProfile);
router.get('/me/rides', requireAuth, userController.getMyRides);
router.post('/me/emergency-contact', requireAuth, userController.addEmergencyContact);
router.get('/:id', userController.getPublicProfile); // public profile is accessible without auth

module.exports = router;
