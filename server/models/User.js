const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User model — supports Rider, Driver, or Both roles.
 * Passwords are hashed with bcrypt (never stored plain).
 * Phone numbers are masked for privacy.
 */
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password_hash: { type: String, select: false }, // excluded from default queries
    google_id: { type: String, index: true, sparse: true },
    avatar: { type: String, default: null }, // URL to profile photo
    phone_masked: { type: String, default: null }, // always shown masked e.g. +91-XXXXX-XX890
    phone_raw: { type: String, select: false }, // never exposed to other users
    role: {
      type: String,
      enum: ['RIDER', 'DRIVER', 'BOTH'],
      default: 'RIDER',
    },
    is_verified: { type: Boolean, default: false },
    is_driver: { type: Boolean, default: false },
    rating: { type: Number, default: 5.0, min: 1, max: 5 },
    total_rides: { type: Number, default: 0 },
    bio: { type: String, maxlength: 300, default: '' },
    emergency_contacts: [
      {
        name: { type: String },
        phone: { type: String },
        relation: { type: String },
      },
    ],
    preferences: {
      smoking_allowed: { type: Boolean, default: false },
      pets_allowed: { type: Boolean, default: false },
      music_pref: { type: String, default: 'Any' },
    },
  },
  { timestamps: true }
);

/**
 * Hash password before saving — only if it's been modified.
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password_hash')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password_hash = await bcrypt.hash(this.password_hash, salt);
  next();
});

/**
 * Instance method — compare plain password against stored hash.
 * @param {string} candidatePassword
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password_hash);
};

module.exports = mongoose.model('User', userSchema);
