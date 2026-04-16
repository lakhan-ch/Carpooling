const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

/**
 * Passport Google OAuth2 Strategy.
 * Finds or creates a user on successful Google authentication.
 */
module.exports = (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID || 'PLACEHOLDER_CLIENT_ID',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'PLACEHOLDER_CLIENT_SECRET',
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists via Google ID
          let user = await User.findOne({ google_id: profile.id });

          if (!user) {
            // Check by email (existing account, now linking Google)
            user = await User.findOne({ email: profile.emails[0].value });

            if (user) {
              // Link Google to existing account
              user.google_id = profile.id;
              if (!user.avatar) user.avatar = profile.photos[0]?.value;
              await user.save();
            } else {
              // Create new user from Google profile
              user = await User.create({
                name: profile.displayName,
                email: profile.emails[0].value,
                google_id: profile.id,
                avatar: profile.photos[0]?.value,
                is_verified: true, // Google accounts are pre-verified
                role: 'RIDER',
              });
            }
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );

  // Serialize / deserialize (used if session-based; we use JWT instead)
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
  });
};
