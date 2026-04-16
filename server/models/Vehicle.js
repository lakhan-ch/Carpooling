const mongoose = require('mongoose');

/**
 * Vehicle model — linked to a driver user.
 * Required before a driver can create a ride pool.
 */
const vehicleSchema = new mongoose.Schema(
  {
    driver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    make: { type: String, required: true },  // e.g. Toyota
    model: { type: String, required: true }, // e.g. Camry
    year: { type: Number },
    color: { type: String },
    license_plate: { type: String, required: true, unique: true, uppercase: true },
    capacity: { type: Number, required: true, min: 1, max: 8 },
    ac: { type: Boolean, default: true },
    photo: { type: String, default: null }, // URL
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
