const express = require('express');
const router = express.Router();
const rideController = require('../controllers/RideController');
const { requireAuth } = require('../middleware/auth');

// Search rides (public)
router.get('/search', rideController.searchRides);

// Get single ride (public, but privacy locks apply)
router.get('/:id', rideController.getRideById);

// Create a ride (driver auth required)
router.post('/', requireAuth, rideController.createRidePool);

// Update ride status
router.put('/:id/status', requireAuth, rideController.updateRideStatus);

// Request to join a ride
router.post('/:id/request', requireAuth, rideController.requestJoinRide);

// Get all join requests for a ride (driver only)
router.get('/:id/requests', requireAuth, rideController.getRideRequests);

// Respond to a specific join request
router.put('/requests/:requestId', requireAuth, rideController.respondToJoinRequest);

module.exports = router;
