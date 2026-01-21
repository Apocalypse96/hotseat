const express = require('express');
const router = express.Router();
const { gameController } = require('../controllers');

// POST /api/games - Create a new game
router.post('/', gameController.createGame);

// GET /api/games/history - Get game history
router.get('/history', gameController.getGameHistory);

// GET /api/games/:id - Get game by ID
router.get('/:id', gameController.getGame);

// GET /api/games/:id/details - Get game details with rounds
router.get('/:id/details', gameController.getGameDetails);

// GET /api/games/:id/next-round - Get next round data
router.get('/:id/next-round', gameController.getNextRound);

// POST /api/games/:id/submit-round - Submit round result
router.post('/:id/submit-round', gameController.submitRound);

module.exports = router;
