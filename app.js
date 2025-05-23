// app.js - Main server entry point
require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Create Express app
const app = express();



// Connect to MongoDB
connectDB();

// Middleware

const allowedOrigins = ['https://testdppfrontend-42cm.vercel.app'];

app.use(cors({
  origin: ['https://testdppfrontend-e59z.vercel.app/'], // allow frontend domain
  methods: ['GET', 'POST', 'PATCH', 'DELETE']
}));


app.use(express.json()); // Body parser

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/dpp', require('./routes/dpp'));

// Error handling middleware (should be last)
app.use(errorHandler);

// Server setup
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});