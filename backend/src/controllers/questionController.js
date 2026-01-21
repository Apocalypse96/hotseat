const { Question } = require('../models');

// Get questions by category
const getQuestionsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20, excludeIds = '' } = req.query;

    // Parse excluded IDs if provided
    const excludedIdArray = excludeIds ? excludeIds.split(',').filter(id => id) : [];

    const query = { category };
    if (excludedIdArray.length > 0) {
      query._id = { $nin: excludedIdArray };
    }

    const questions = await Question.find(query)
      .limit(parseInt(limit))
      .select('_id text category');

    res.json({
      success: true,
      data: questions,
      count: questions.length
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch questions'
    });
  }
};

// Get a random question from category (excluding used ones)
const getRandomQuestion = async (req, res) => {
  try {
    const { category } = req.params;
    const { excludeIds = '' } = req.query;

    const excludedIdArray = excludeIds ? excludeIds.split(',').filter(id => id) : [];

    const query = { category };
    if (excludedIdArray.length > 0) {
      query._id = { $nin: excludedIdArray };
    }

    // Use aggregation to get a random question
    const questions = await Question.aggregate([
      { $match: query },
      { $sample: { size: 1 } }
    ]);

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No more questions available in this category'
      });
    }

    res.json({
      success: true,
      data: questions[0]
    });
  } catch (error) {
    console.error('Error fetching random question:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch random question'
    });
  }
};

// Get all categories with question counts
const getCategories = async (req, res) => {
  try {
    const categories = await Question.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          category: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
};

module.exports = {
  getQuestionsByCategory,
  getRandomQuestion,
  getCategories
};
