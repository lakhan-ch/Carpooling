const mongoose = require('mongoose');

/**
 * JoinRequest model — a rider's request to join a driver's ride pool.
 */
const joinRequestSchema = new mongoose.Schema(
  {
    ride_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RidePool',
      required: true,
      index: true,
    },
    rider_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seats_requested: { type: Number, default: 1, min: 1 },
    message: { type: String, maxlength: 300, default: '' },
    // Rider's actual route (may differ from driver's)
    rider_pickup_coords: {
      type: [Number], // [lng, lat]
      default: null,
    },
    rider_drop_coords: {
      type: [Number], // [lng, lat]
      default: null,
    },
    match_score: { type: Number, default: 0 }, // 0-100
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate requests from same rider for same ride
joinRequestSchema.index({ ride_id: 1, rider_id: 1 }, { unique: true });

module.exports = mongoose.model('JoinRequest', joinRequestSchema);
