const AuditLog = require('../models/AuditLog');

/**
 * NotificationService — handles SOS alerts and in-app event logging.
 * In production: integrate Twilio/SendGrid/FCM here.
 */

/**
 * Send SOS alert to emergency contacts.
 * @param {Object} user - User document
 * @param {number[]} coords - [lat, lng] of distressed user
 */
async function sendSOSAlert(user, coords) {
  const contacts = user.emergency_contacts || [];

  contacts.forEach((contact) => {
    // TODO: Replace with real SMS/email integration (Twilio/SendGrid)
    console.log(
      `[SOS] Alerting ${contact.name} (${contact.phone}): ` +
      `${user.name} needs help at [${coords[0]}, ${coords[1]}]`
    );
  });

  // Log the SOS event in the audit log
  await AuditLog.create({
    action: 'SOS_TRIGGERED',
    user_id: user._id,
    metadata: {
      coords,
      contacts_notified: contacts.length,
      timestamp: new Date(),
    },
  });
}

/**
 * Log a general audit event.
 * @param {string} action
 * @param {ObjectId} userId
 * @param {Object} metadata
 * @param {string} ip
 */
async function logEvent(action, userId, metadata = {}, ip = '') {
  try {
    await AuditLog.create({ action, user_id: userId, metadata, ip_address: ip });
  } catch (err) {
    console.error('[NotificationService] logEvent error:', err.message);
  }
}

module.exports = { sendSOSAlert, logEvent };
