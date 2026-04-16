const Message = require('../models/Message');
const JoinRequest = require('../models/JoinRequest');

/**
 * GET /api/chat/:rideId
 * Get conversation history. Only available to driver or approved rider.
 */
exports.getMessages = async (req, res) => {
  try {
    const rideId = req.params.rideId;

    // Verify the user has access to this chat
    const request = await JoinRequest.findOne({
      ride_id: rideId,
      $or: [
        { rider_id: req.user.id, status: 'APPROVED' },
      ],
    }).populate('ride_id');

    const isDriver = request?.ride_id?.driver_id?.toString() === req.user.id;
    const isApprovedRider = !!request;

    if (!isDriver && !isApprovedRider) {
      // Also allow if user is the driver
      const { RidePool } = require('../models/RidePool');
      const ride = await RidePool.findOne({ _id: rideId, driver_id: req.user.id });
      if (!ride) {
        return res.status(403).json({ message: 'Access denied. Request must be approved to chat.' });
      }
    }

    const messages = await Message.find({ ride_id: rideId })
      .populate('sender_id', 'name avatar')
      .sort({ createdAt: 1 })
      .limit(200);

    // Mark messages to this user as read
    await Message.updateMany(
      { ride_id: rideId, receiver_id: req.user.id, is_read: false },
      { is_read: true }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/chat/:rideId
 * Send a message (REST fallback — primary path is Socket.IO).
 */
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ message: 'Message content is required.' });
    }

    const message = await Message.create({
      ride_id: req.params.rideId,
      sender_id: req.user.id,
      receiver_id: receiverId,
      content: content.trim(),
    });

    const populated = await message.populate('sender_id', 'name avatar');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
