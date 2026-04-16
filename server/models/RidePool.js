const mongoose = require('mongoose');

/**
 * RidePool model — a ride offer created by a driver.
 * Stores GeoJSON Points for geospatial queries (2dsphere index).
 * price_per_seat and match_score enable intelligent ranking.
 */
const ridePoolSchema = new mongoose.Schema(
  {
    driver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    vehicle_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
    },
    pickup_location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    drop_location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    pickup_address: { type: String, required: true },
    drop_address: { type: String, required: true },
    pickup_city: { type: String, index: true },
    drop_city: { type: String, index: true },
    departure_time: { type: Date, required: true, index: true },
    available_seats: { type: Number, required: true, min: 1, max: 8 },
    total_seats: { type: Number, required: true },
    price_per_seat: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
      default: 'SCHEDULED',
      index: true,
    },
    preferences: {
      smoking_allowed: { type: Boolean, default: false },
      pets_allowed: { type: Boolean, default: false },
      female_only: { type: Boolean, default: false },
      music_pref: { type: String, default: 'None' },
      luggage_allowed: { type: Boolean, default: true },
    },
    // Pre-computed route bounding box for fast proximity checks
    route_bbox: {
      min_lat: Number,
      max_lat: Number,
      min_lng: Number,
      max_lng: Number,
    },
  },
  { timestamps: true }
);

// Geospatial indexes for location-based queries — O(log n) lookup
ridePoolSchema.index({ pickup_location: '2dsphere' });
ridePoolSchema.index({ drop_location: '2dsphere' });

// Compound index for common search pattern
ridePoolSchema.index({ departure_time: 1, status: 1, available_seats: 1 });

module.exports = mongoose.model('RidePool', ridePoolSchema);
