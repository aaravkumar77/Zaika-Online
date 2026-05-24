const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
require('dotenv').config();

const User = mongoose.model('User');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    // Await the promise from the database query
    const user = await User.findById(id);
    
    // Pass the user to the 'done' callback (user can be null if not found)
    done(null, user);
  } catch (err) {
    // If any error occurs during the query, pass it to the 'done' callback
    done(err, null);
  }
});

// In config/passport.js
// Only configure Google OAuth when credentials are present. This avoids
// crashing the server in dev/test environments where env vars are not set.
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => { 
    const requestedRole = ["customer", "vendor"].includes(req.session.googleAuthRole)
      ? req.session.googleAuthRole
      : "customer";
    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);
    const email = profile.emails[0].value;
    const isAdmin = adminEmails.includes(email.toLowerCase());

    let user = await User.findOne({ googleId: profile.id });
    if (user) {
      if (isAdmin && user.role !== "admin") {
        user.role = "admin";
        await user.save();
      } else if (!isAdmin && requestedRole === "vendor" && user.role === "customer") {
        user.role = "vendor";
        await user.save();
      }

      return done(null, {
        ...user.toObject(),
        selectedRole: isAdmin ? "admin" : requestedRole,
      });
    }

    // User not found, create them
    user = new User({
      googleId: profile.id,
      name: profile.displayName,
      email,
      avatar: profile.photos[0].value,
      role: isAdmin ? "admin" : requestedRole
    });
    await user.save();
    return done(null, {
      ...user.toObject(),
      selectedRole: user.role === "admin" ? "admin" : requestedRole,
    });
  }
));
} else {
  console.warn('⚠️ GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set — Google OAuth disabled.');
}
