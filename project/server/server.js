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
import createPagesRouter from './routes/pages.js';
import './passport.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 3000;
const app = express();

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
app.use('/covers', express.static(path.join(__dirname, '../client/public/covers')));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'someRandomSecret123',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
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

// In-memory storage
let journals = [];

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  console.log('🔐 Auth check:', {
    isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : false,
    user: req.user ? { id: req.user.id, email: req.user.email } : null
  });
  
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
};

// GET all journals - MUST come before /:id route
app.get('/api/journals', requireAuth, (req, res) => {
  try {
    const userId = req.user?.id || req.user?.googleId;
    console.log('📚 GET /api/journals');
    console.log('👤 User ID:', userId);
    console.log('📊 Total journals in memory:', journals.length);
    
    const userJournals = journals.filter(j => j.userId === userId);
    console.log('📊 User\'s journals:', userJournals.length);
    
    res.json(userJournals);
  } catch (error) {
    console.error('❌ Error fetching journals:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch journals'
    });
  }
});

// POST create journal
app.post('/api/journals', requireAuth, (req, res) => {
  try {
    const { name, description, coverImage, coverColor, coverName } = req.body;
    const userId = req.user?.id || req.user?.googleId;

    console.log('📝 POST /api/journals');
    console.log('👤 User ID:', userId);
    console.log('📋 Data:', { name, coverImage, coverColor });

    if (!name || !name.trim()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        message: 'Journal name is required.' 
      });
    }

    const newJournal = {
      id: Date.now(),
      name: name.trim(),
      description: description?.trim() || '',
      coverImage: coverImage || null,
      coverColor: coverColor || '#8b5cf6',
      coverName: coverName || 'default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: userId,
      pageCount: 0,
      tags: [],
      location: ''
    };

    journals.push(newJournal);
    console.log('✅ Journal created:', newJournal.name);
    console.log('📊 Total journals now:', journals.length);

    res.status(201).json(newJournal);
  } catch (error) {
    console.error('❌ Error creating journal:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to create journal'
    });
  }
});

// GET single journal by ID
app.get('/api/journals/:id', requireAuth, (req, res) => {
  try {
    const journalId = parseInt(req.params.id);
    const userId = req.user?.id || req.user?.googleId;
    
    console.log('🔍 GET /api/journals/:id');
    console.log('📋 Looking for journal:', journalId);
    console.log('👤 User ID:', userId);
    
    const journal = journals.find(j => j.id === journalId && j.userId === userId);
    
    if (!journal) {
      console.log('❌ Journal not found');
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Journal not found' 
      });
    }
    
    console.log('✅ Found journal:', journal.name);
    res.json(journal);
  } catch (error) {
    console.error('❌ Error fetching journal:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch journal'
    });
  }
});

// PUT update journal
app.put('/api/journals/:id', requireAuth, (req, res) => {
  try {
    const journalId = parseInt(req.params.id);
    const userId = req.user?.id || req.user?.googleId;
    const { name, description, coverImage, coverColor } = req.body;
    
    console.log('✏️ PUT /api/journals/:id');
    console.log('📋 Updating journal:', journalId);
    
    const journalIndex = journals.findIndex(j => j.id === journalId && j.userId === userId);
    
    if (journalIndex === -1) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Journal not found' 
      });
    }
    
    journals[journalIndex] = {
      ...journals[journalIndex],
      name: name?.trim() || journals[journalIndex].name,
      description: description?.trim() || journals[journalIndex].description,
      coverImage: coverImage || journals[journalIndex].coverImage,
      coverColor: coverColor || journals[journalIndex].coverColor,
      updatedAt: new Date().toISOString()
    };
    
    console.log('✅ Journal updated:', journals[journalIndex].name);
    res.json(journals[journalIndex]);
  } catch (error) {
    console.error('❌ Error updating journal:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to update journal'
    });
  }
});

// DELETE journal
app.delete('/api/journals/:id', requireAuth, (req, res) => {
  try {
    const journalId = parseInt(req.params.id);
    const userId = req.user?.id || req.user?.googleId;
    
    console.log('🗑️ DELETE /api/journals/:id');
    console.log('📋 Deleting journal:', journalId);
    
    const journalIndex = journals.findIndex(j => j.id === journalId && j.userId === userId);
    
    if (journalIndex === -1) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Journal not found' 
      });
    }
    
    const deletedJournal = journals[journalIndex];
    journals.splice(journalIndex, 1);
    
    console.log('✅ Journal deleted:', deletedJournal.name);
    res.json({ message: 'Journal deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting journal:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to delete journal'
    });
  }
});

// Pages routes (needs access to journals array)
const pagesRouter = createPagesRouter(journals, requireAuth);
app.use('/', pagesRouter);

// Debug endpoint (remove in production)
app.get('/api/debug/journals', (req, res) => {
  res.json({
    total: journals.length,
    journals: journals.map(j => ({
      id: j.id,
      name: j.name,
      userId: j.userId
    }))
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// 404 handler - MUST be last
app.use((req, res) => {
  console.log('❌ 404 Not Found:', req.method, req.url);
  res.status(404).json({ error: 'Not Found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend: http://localhost:5173`);
});