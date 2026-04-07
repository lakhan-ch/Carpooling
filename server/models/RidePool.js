const mongoose = require('mongoose');

const ridePoolSchema = new mongoose.Schema({
  driver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pickup_location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  drop_location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  pickup_address: { type: String },
  drop_address: { type: String },
  departure_time: { type: Date, required: true },
  available_seats: { type: Number, required: true },
  status: { type: String, enum: ['SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED'], default: 'SCHEDULED' },
  preferences: {
    smoking_allowed: { type: Boolean, default: false },
    pets_allowed: { type: Boolean, default: false },
    female_only: { type: Boolean, default: false },
    music_pref: { type: String, default: 'None' }
  }
}, { timestamps: true });

// Create 2dsphere indexes for geospatial queries
ridePoolSchema.index({ pickup_location: '2dsphere' });
ridePoolSchema.index({ drop_location: '2dsphere' });

module.exports = mongoose.model('RidePool', ridePoolSchema);
