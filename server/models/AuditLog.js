const mongoose = require('mongoose');

/**
 * AuditLog model for tracking important system events.
 * Used for monitoring, debugging, and compliance.
 */
const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        'USER_REGISTER',
        'USER_LOGIN',
        'RIDE_CREATED',
        'RIDE_JOINED',
        'REQUEST_APPROVED',
        'REQUEST_REJECTED',
        'SOS_TRIGGERED',
        'RIDE_COMPLETED',
        'RIDE_CANCELLED',
      ],
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed, // flexible payload per action
    },
    ip_address: { type: String },
  },
  { timestamps: true }
);

// Compound index for efficient log queries by user and time
auditLogSchema.index({ user_id: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
