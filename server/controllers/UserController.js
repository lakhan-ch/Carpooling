const User = require('../models/User');
const RidePool = require('../models/RidePool');
const JoinRequest = require('../models/JoinRequest');

/**
 * GET /api/users/me
 * Get the authenticated user's profile.
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password_hash -phone_raw');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * PUT /api/users/me
 * Update authenticated user's profile.
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, role, preferences, phone } = req.body;

    const update = {};
    if (name) update.name = name;
    if (bio !== undefined) update.bio = bio;
    if (role) update.role = role;
    if (preferences) update.preferences = preferences;
    if (phone) {
      update.phone_raw = phone;
      // Mask the phone: show only last 3 digits
      update.phone_masked = phone.replace(/(\d{3})\d+(\d{3})$/, '$1XXXXX$2');
    }

    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true }).select(
      '-password_hash -phone_raw'
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/users/:id
 * Get a public user profile (limited info — privacy-first).
 * Full contact info is only visible after an approved ride request.
 */
exports.getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      'name avatar rating total_rides bio is_verified createdAt'
    );
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/users/me/rides
 * Get all rides (as driver and as rider) for the authenticated user.
 */
exports.getMyRides = async (req, res) => {
  try {
    const [asDriver, asRider] = await Promise.all([
      RidePool.find({ driver_id: req.user.id })
        .sort({ departure_time: -1 })
        .populate('vehicle_id', 'make model color license_plate'),
      JoinRequest.find({ rider_id: req.user.id })
        .populate({
          path: 'ride_id',
          populate: { path: 'driver_id', select: 'name avatar rating' },
        })
        .sort({ createdAt: -1 }),
    ]);

    res.json({ asDriver, asRider });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/users/me/emergency-contact
 * Add an emergency contact.
 */
exports.addEmergencyContact = async (req, res) => {
  try {
    const { name, phone, relation } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ message: 'Contact name and phone are required.' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $push: { emergency_contacts: { name, phone, relation } } },
      { new: true }
    ).select('emergency_contacts');

    res.json(user.emergency_contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
