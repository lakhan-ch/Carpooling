const RidePool = require('../models/RidePool');
const Vehicle = require('../models/Vehicle');
const JoinRequest = require('../models/JoinRequest');

exports.createRidePool = async (req, res) => {
    try {
        const { driverId, pickupCoords, dropCoords, pickupAddress, dropAddress, departureTime, availableSeats, preferences } = req.body;

        // Basic validation and Vehicle existence check logic here if needed
        const vehicle = await Vehicle.findOne({ driver_id: driverId });
        if (!vehicle) {
            return res.status(400).json({ message: "Driver must have a registered vehicle." });
        }

        const newRide = new RidePool({
            driver_id: driverId,
            pickup_location: { type: 'Point', coordinates: pickupCoords },
            drop_location: { type: 'Point', coordinates: dropCoords },
            pickup_address: pickupAddress,
            drop_address: dropAddress,
            departure_time: departureTime,
            available_seats: availableSeats,
            preferences: preferences
        });

        await newRide.save();
        res.status(201).json(newRide);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.requestJoinRide = async (req, res) => {
    try {
        const { rideId, riderId } = req.body;

        const ride = await RidePool.findById(rideId);
        if (!ride || ride.available_seats <= 0) {
            return res.status(400).json({ message: "Ride is not available or full." });
        }

        const request = new JoinRequest({
            ride_id: rideId,
            rider_id: riderId,
            status: 'PENDING'
        });

        await request.save();
        res.status(201).json(request);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.respondToJoinRequest = async (req, res) => {
    try {
        const { requestId, driverAction } = req.body; // driverAction is 'APPROVE' or 'REJECT'

        const joinRequest = await JoinRequest.findById(requestId).populate('ride_id');
        if (!joinRequest) {
            return res.status(404).json({ message: "Join request not found." });
        }

        joinRequest.status = driverAction;
        await joinRequest.save();

        if (driverAction === 'APPROVED') {
            const ride = joinRequest.ride_id;
            ride.available_seats -= 1;
            await ride.save();
        }

        res.status(200).json(joinRequest);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
