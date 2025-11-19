import dotenv from 'dotenv';
dotenv.config();

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

const callbackURL = 'https://stickerbackend.onrender.com/auth/google/callback';

console.log('🔐 Configuring Google Strategy with callback:', callbackURL);
console.log('🔐 NODE_ENV:', process.env.NODE_ENV);
console.log('🔐 CLIENT_ID exists:', !!process.env.GOOGLE_CLIENT_ID);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: callbackURL,
      proxy: true,
    },
    (accessToken, refreshToken, profile, done) => {
      console.log('✅ Google auth successful for:', profile.displayName);
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

export default passport;