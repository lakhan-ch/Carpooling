const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone_masked: { type: String },
  role: { type: String, enum: ['RIDER', 'DRIVER', 'BOTH'], default: 'RIDER' },
  is_verified: { type: Boolean, default: false },
  rating: { type: Number, default: 5.0 }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
