const express = require('express');
const router = express.Router();

const questionRoutes = require('./questionRoutes');
const gameRoutes = require('./gameRoutes');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'HotSeat API is running',
    timestamp: new Date().toISOString()
  });
});

// Mount routes
router.use('/questions', questionRoutes);
router.use('/games', gameRoutes);

module.exports = router;
