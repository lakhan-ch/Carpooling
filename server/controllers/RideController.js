const RidePool = require('../models/RidePool');
const JoinRequest = require('../models/JoinRequest');
const Vehicle = require('../models/Vehicle');
const { rankRides } = require('../services/MatchingService');
const CacheService = require('../services/CacheService');
const { logEvent } = require('../services/NotificationService');

/**
 * POST /api/rides
 * Create a new ride pool as a driver.
 */
exports.createRidePool = async (req, res) => {
  try {
    const {
      pickupCoords, dropCoords, pickupAddress, dropAddress,
      pickupCity, dropCity, departureTime, availableSeats,
      pricePerSeat, preferences, vehicleId,
    } = req.body;

    // Driver must have a registered vehicle
    const vehicle = vehicleId
      ? await Vehicle.findById(vehicleId)
      : await Vehicle.findOne({ driver_id: req.user.id });

    if (!vehicle) {
      return res.status(400).json({ message: 'You must register a vehicle before creating a ride.' });
    }

    const newRide = new RidePool({
      driver_id: req.user.id,
      vehicle_id: vehicle._id,
      pickup_location: { type: 'Point', coordinates: pickupCoords }, // [lng, lat]
      drop_location: { type: 'Point', coordinates: dropCoords },
      pickup_address: pickupAddress,
      drop_address: dropAddress,
      pickup_city: pickupCity,
      drop_city: dropCity,
      departure_time: new Date(departureTime),
      available_seats: availableSeats,
      total_seats: availableSeats,
      price_per_seat: pricePerSeat || 0,
      preferences,
    });

    await newRide.save();
    await logEvent('RIDE_CREATED', req.user.id, { rideId: newRide._id }, req.ip);

    res.status(201).json(newRide);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/rides/search
 * Search for rides with intelligent matching and Redis caching.
 * Query params: pickupLat, pickupLng, dropLat, dropLng, date, seats
 */
exports.searchRides = async (req, res) => {
  try {
    const { pickupLat, pickupLng, dropLat, dropLng, date, seats, maxPrice } = req.query;

    if (!pickupLat || !pickupLng) {
      return res.status(400).json({ message: 'Pickup coordinates are required.' });
    }

    // --- Try Redis cache first ---
    const cacheKey = CacheService.buildSearchKey({ pickupLat, pickupLng, dropLat, dropLng, date, seats });
    const cached = await CacheService.get(cacheKey);
    if (cached) {
      return res.json({ rides: cached, cached: true });
    }

    // --- Build MongoDB query ---
    const query = {
      status: 'SCHEDULED',
      available_seats: { $gte: parseInt(seats) || 1 },
    };

    // Date filter: rides departing on the given date (full day range)
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.departure_time = { $gte: start, $lte: end };
    } else {
      // Default: only future rides
      query.departure_time = { $gte: new Date() };
    }

    if (maxPrice) {
      query.price_per_seat = { $lte: parseFloat(maxPrice) };
    }

    // Geospatial: rides with pickup within 15km of rider's pickup
    if (pickupLat && pickupLng) {
      query.pickup_location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(pickupLng), parseFloat(pickupLat)],
          },
          $maxDistance: 15000, // 15km in metres
        },
      };
    }

    const rides = await RidePool.find(query)
      .populate('driver_id', 'name avatar rating total_rides is_verified')
      .populate('vehicle_id', 'make model color ac')
      .limit(50);

    // --- Score and rank ---
    let rankedRides = rides;
    if (dropLat && dropLng) {
      rankedRides = rankRides(
        rides,
        [parseFloat(pickupLng), parseFloat(pickupLat)],
        [parseFloat(dropLng), parseFloat(dropLat)],
        date ? new Date(date) : null
      );
    }

    // Cache results for 60 seconds
    await CacheService.set(cacheKey, rankedRides, 60);

    res.json({ rides: rankedRides, cached: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/rides/:id
 * Get a single ride by ID with driver info.
 * Driver contact info is blurred unless request is approved.
 */
exports.getRideById = async (req, res) => {
  try {
    const ride = await RidePool.findById(req.params.id)
      .populate('driver_id', 'name avatar rating bio total_rides is_verified')
      .populate('vehicle_id');

    if (!ride) return res.status(404).json({ message: 'Ride not found.' });

    // Check if requesting user has an approved request (privacy unlock)
    let hasApprovedRequest = false;
    if (req.user) {
      const request = await JoinRequest.findOne({
        ride_id: ride._id,
        rider_id: req.user.id,
        status: 'APPROVED',
      });
      hasApprovedRequest = !!request;
    }

    const rideObj = ride.toObject();

    // If no approved request, mask driver details
    if (!hasApprovedRequest && req.user?.id !== ride.driver_id._id?.toString()) {
      rideObj.driver_id = {
        ...rideObj.driver_id,
        // Remove sensitive fields; keep public info
        phone_masked: undefined,
      };
      rideObj.privacy_locked = true;
    }

    res.json(rideObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * PUT /api/rides/:id/status
 * Driver updates their ride status (ACTIVE, COMPLETED, CANCELLED).
 */
exports.updateRideStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ride = await RidePool.findOne({ _id: req.params.id, driver_id: req.user.id });

    if (!ride) return res.status(404).json({ message: 'Ride not found or unauthorized.' });

    ride.status = status;
    await ride.save();

    if (status === 'COMPLETED') {
      await logEvent('RIDE_COMPLETED', req.user.id, { rideId: ride._id }, req.ip);
    } else if (status === 'CANCELLED') {
      await logEvent('RIDE_CANCELLED', req.user.id, { rideId: ride._id }, req.ip);
    }

    res.json(ride);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/rides/:id/request
 * Rider requests to join a ride.
 */
exports.requestJoinRide = async (req, res) => {
  try {
    const { seatsRequested, message, riderPickupCoords, riderDropCoords } = req.body;
    const rideId = req.params.id;

    const ride = await RidePool.findById(rideId);
    if (!ride || ride.available_seats < (seatsRequested || 1)) {
      return res.status(400).json({ message: 'Ride not available or not enough seats.' });
    }

    // Prevent duplicate requests
    const existing = await JoinRequest.findOne({ ride_id: rideId, rider_id: req.user.id });
    if (existing) {
      return res.status(409).json({ message: 'You already have a request for this ride.' });
    }

    const request = new JoinRequest({
      ride_id: rideId,
      rider_id: req.user.id,
      seats_requested: seatsRequested || 1,
      message: message || '',
      rider_pickup_coords: riderPickupCoords,
      rider_drop_coords: riderDropCoords,
    });

    await request.save();
    await logEvent('RIDE_JOINED', req.user.id, { rideId }, req.ip);

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * PUT /api/rides/requests/:requestId
 * Driver approves or rejects a join request.
 */
exports.respondToJoinRequest = async (req, res) => {
  try {
    const { action } = req.body; // 'APPROVED' or 'REJECTED'
    const joinRequest = await JoinRequest.findById(req.params.requestId).populate('ride_id');

    if (!joinRequest) {
      return res.status(404).json({ message: 'Join request not found.' });
    }

    // Confirm the requester is the driver of this ride
    if (joinRequest.ride_id.driver_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to respond to this request.' });
    }

    joinRequest.status = action;
    await joinRequest.save();

    if (action === 'APPROVED') {
      const ride = joinRequest.ride_id;
      ride.available_seats -= joinRequest.seats_requested;
      await ride.save();
      await logEvent('REQUEST_APPROVED', req.user.id, { requestId: joinRequest._id }, req.ip);
    } else {
      await logEvent('REQUEST_REJECTED', req.user.id, { requestId: joinRequest._id }, req.ip);
    }

    res.json(joinRequest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/rides/:id/requests
 * Get all join requests for a ride (driver only).
 */
exports.getRideRequests = async (req, res) => {
  try {
    const ride = await RidePool.findOne({ _id: req.params.id, driver_id: req.user.id });
    if (!ride) return res.status(404).json({ message: 'Ride not found or unauthorized.' });

    const requests = await JoinRequest.find({ ride_id: req.params.id })
      .populate('rider_id', 'name avatar rating total_rides is_verified bio')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
