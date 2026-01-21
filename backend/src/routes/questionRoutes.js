const express = require('express');
const router = express.Router();
const { questionController } = require('../controllers');

// GET /api/questions/categories - Get all categories with counts
router.get('/categories', questionController.getCategories);

// GET /api/questions/:category - Get questions by category
router.get('/:category', questionController.getQuestionsByCategory);

// GET /api/questions/:category/random - Get a random question
router.get('/:category/random', questionController.getRandomQuestion);

module.exports = router;
