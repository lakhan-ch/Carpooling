const User = require('../models/User');
const { generateToken } = require('../utils/jwtUtils');
const { logEvent } = require('../services/NotificationService');
const passport = require('passport');

/**
 * POST /api/auth/register
 * Register a new user with email + password.
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    const user = new User({
      name,
      email: email.toLowerCase(),
      password_hash: password, // pre-save hook will hash this
      role: role || 'RIDER',
    });
    await user.save();

    await logEvent('USER_REGISTER', user._id, { email }, req.ip);

    const token = generateToken(user);

    res
      .cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .status(201)
      .json({
        message: 'Registered successfully.',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/auth/login
 * Login with email + password.
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Must explicitly select password_hash (excluded by default)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password_hash');
    if (!user || !user.password_hash) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    await logEvent('USER_LOGIN', user._id, { email }, req.ip);

    const token = generateToken(user);

    res
      .cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: 'Logged in successfully.',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          rating: user.rating,
        },
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/auth/google
 * Redirect to Google OAuth consent screen.
 */
exports.googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

/**
 * GET /api/auth/google/callback
 * Handle Google OAuth callback and issue JWT.
 */
exports.googleCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, async (err, user) => {
    if (err || !user) {
      return res.redirect(
        `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=oauth_failed`
      );
    }

    const token = generateToken(user);
    await logEvent('USER_LOGIN', user._id, { method: 'google' }, req.ip);

    // Redirect to frontend with token in query (frontend stores in localStorage/cookie)
    res.redirect(
      `${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/callback?token=${token}`
    );
  })(req, res, next);
};

/**
 * POST /api/auth/logout
 * Clear the auth cookie.
 */
exports.logout = (req, res) => {
  res.clearCookie('token').json({ message: 'Logged out successfully.' });
};

/**
 * GET /api/auth/me
 * Return the currently authenticated user.
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password_hash -phone_raw');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
