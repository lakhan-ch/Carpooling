const express = require('express');
const router = express.Router();
const rideController = require('../controllers/RideController');

// Define API endpoints for Ride pooling
router.post('/create', rideController.createRidePool);
router.post('/join', rideController.requestJoinRide);
router.post('/respond', rideController.respondToJoinRequest);

module.exports = router;
