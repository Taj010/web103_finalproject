import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import favicon from 'serve-favicon';
import session from 'express-session';
import passport from 'passport';
import authRoutes from './routes/auth.js';
import './passport.js';

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());

app.use(
  session({
    secret: process.env.JWT_SECRET || 'someRandomSecret123',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

if (process.env.NODE_ENV === 'development') {
  app.use(favicon(path.resolve('../', 'client', 'public', 'logo.png')));
} else if (process.env.NODE_ENV === 'production') {
  app.use(favicon(path.resolve('public', 'logo.png')));
  app.use(express.static('public'));
}

app.use('/auth', authRoutes);

if (process.env.NODE_ENV === 'production') {
  app.get('/*', (_, res) =>
    res.sendFile(path.resolve('public', 'index.html'))
  );
}

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
