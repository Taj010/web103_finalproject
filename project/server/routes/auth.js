import express from 'express';
import passport from 'passport';

const router = express.Router();

const FRONTEND_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://stickerystory.onrender.com'
    : 'http://localhost:5173';

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect(`${FRONTEND_URL}/journals`);  // Fixed!
  }
);

router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect(FRONTEND_URL);
  });
});

router.get('/me', (req, res) => {
  res.json(req.user || null);
});

export default router;