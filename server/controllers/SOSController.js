const User = require('../models/User');
const { sendSOSAlert, logEvent } = require('../services/NotificationService');

/**
 * POST /api/sos
 * Trigger an SOS alert. Notifies emergency contacts with user's location.
 */
exports.triggerSOS = async (req, res) => {
  try {
    const { lat, lng, message } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Location coordinates are required for SOS.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    await sendSOSAlert(user, [lat, lng]);

    await logEvent('SOS_TRIGGERED', user._id, {
      coords: [lat, lng],
      message: message || 'Emergency!',
    }, req.ip);

    res.json({
      message: 'SOS alert sent.',
      contacts_notified: user.emergency_contacts?.length || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
