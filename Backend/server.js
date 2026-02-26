const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { port } = require('./config/config');
const { connectDb } = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

const indexRoute = require('./routes');

// Rate limiting setup
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Increased for dev
  message: {
    message: 'Too many requests from this IP',
    success: false
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const app = express();

// Middleware setup - CORS MUST BE FIRST
app.use(cors({
  origin: true, // Allow all origins in dev for now
  credentials: true
}));

console.log("CORS Middleware Initialized");

app.use(limiter);
// Disabling helmet temporarily to check if it's blocking preflights
// app.use(helmet()); 

app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1', indexRoute);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  connectDb();
});
