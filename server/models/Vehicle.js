const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  driver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  model: { type: String, required: true },
  license_plate: { type: String, required: true, unique: true },
  capacity: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
