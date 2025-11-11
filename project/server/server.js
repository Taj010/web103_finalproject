import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import favicon from 'serve-favicon';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import './passport.js';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 3000;
const app = express();

// Trust proxy (important for production)
app.set('trust proxy', 1);

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL_PROD 
    : 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
// For covers folder (if you have images in public/covers)
app.use('/covers', express.static(path.join(__dirname, '../client/public/covers')));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'someRandomSecret123',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Favicon
if (process.env.NODE_ENV === 'development') {
  try {
    app.use(favicon(path.join(__dirname, '../client/public/logo.png')));
  } catch (err) {
    console.log('⚠️  Favicon not found, skipping...');
  }
} else if (process.env.NODE_ENV === 'production') {
  app.use(favicon(path.resolve('public', 'logo.png')));
  app.use(express.static('public'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Auth routes
app.use('/auth', authRoutes);

// ==========================================
// JOURNAL ROUTES
// ==========================================

// In-memory storage (TODO: Replace with database)
let journals = [];

// Middleware to check authentication (basic version)
const requireAuth = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
};

// Create Journal endpoint
app.post('/api/journals', requireAuth, (req, res) => {
  try {
    const { name, description, coverImage, coverColor, coverName } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        message: 'Journal name is required.' 
      });
    }

    // Create new journal object
    const newJournal = {
      id: Date.now(), // Simple unique ID (use UUID in production)
      name: name.trim(),
      description: description?.trim() || '',
      coverImage: coverImage || null,
      coverColor: coverColor || '#8b5cf6',
      coverName: coverName || 'default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: req.user?.id || req.user?.googleId, // Associate with logged-in user
      pageCount: 0,
      tags: [],
      location: ''
    };

    journals.push(newJournal);

    console.log('✅ Journal created:', newJournal.name);
    res.status(201).json(newJournal);
  } catch (error) {
    console.error('❌ Error creating journal:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to create journal'
    });
  }
});

// Get all journals for the authenticated user
app.get('/api/journals', requireAuth, (req, res) => {
  try {
    const userId = req.user?.id || req.user?.googleId;
    
    // Filter journals by user (in production, this would be a DB query)
    const userJournals = journals.filter(j => j.userId === userId);
    
    res.json(userJournals);
  } catch (error) {
    console.error('❌ Error fetching journals:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch journals'
    });
  }
});

// Get a specific journal by ID
app.get('/api/journals/:id', requireAuth, (req, res) => {
  try {
    const journalId = parseInt(req.params.id);
    const userId = req.user?.id || req.user?.googleId;
    
    const journal = journals.find(j => j.id === journalId && j.userId === userId);
    
    if (!journal) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Journal not found' 
      });
    }
    
    res.json(journal);
  } catch (error) {
    console.error('❌ Error fetching journal:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch journal'
    });
  }
});

// Update a journal
app.put('/api/journals/:id', requireAuth, (req, res) => {
  try {
    const journalId = parseInt(req.params.id);
    const userId = req.user?.id || req.user?.googleId;
    const { name, description, coverImage, coverColor } = req.body;
    
    const journalIndex = journals.findIndex(j => j.id === journalId && j.userId === userId);
    
    if (journalIndex === -1) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Journal not found' 
      });
    }
    
    // Update journal
    journals[journalIndex] = {
      ...journals[journalIndex],
      name: name?.trim() || journals[journalIndex].name,
      description: description?.trim() || journals[journalIndex].description,
      coverImage: coverImage || journals[journalIndex].coverImage,
      coverColor: coverColor || journals[journalIndex].coverColor,
      updatedAt: new Date().toISOString()
    };
    
    res.json(journals[journalIndex]);
  } catch (error) {
    console.error('❌ Error updating journal:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to update journal'
    });
  }
});

// Delete a journal
app.delete('/api/journals/:id', requireAuth, (req, res) => {
  try {
    const journalId = parseInt(req.params.id);
    const userId = req.user?.id || req.user?.googleId;
    
    const journalIndex = journals.findIndex(j => j.id === journalId && j.userId === userId);
    
    if (journalIndex === -1) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Journal not found' 
      });
    }
    
    journals.splice(journalIndex, 1);
    
    res.json({ message: 'Journal deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting journal:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to delete journal'
    });
  }
});

// TODO: Add page routes
// app.use('/api/journals/:journalId/pages', pageRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.get('/*', (_, res) =>
    res.sendFile(path.resolve('public', 'index.html'))
  );
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🔗 Frontend: http://localhost:5173`);
  }
});