const { Game, Round, Question } = require('../models');

// Create a new game session
const createGame = async (req, res) => {
  try {
    const { category, totalRounds, players } = req.body;

    // Validate request body
    if (!category || !totalRounds || !players || !Array.isArray(players)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: category, totalRounds, and players array'
      });
    }

    if (players.length < 2 || players.length > 8) {
      return res.status(400).json({
        success: false,
        error: 'A game must have between 2 and 8 players'
      });
    }

    // Validate category
    const validCategories = ['Friends', 'Date', 'Family', 'Deep', 'Funny'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category. Must be one of: Friends, Date, Family, Deep, Funny'
      });
    }

    // Check if enough questions exist for the category
    const questionCount = await Question.countDocuments({ category });
    if (questionCount < totalRounds) {
      return res.status(400).json({
        success: false,
        error: `Not enough questions in ${category} category. Available: ${questionCount}, Required: ${totalRounds}`
      });
    }

    // Create player objects with initial score of 0
    const playerObjects = players.map(name => ({
      name: name.trim(),
      score: 0
    }));

    const game = await Game.create({
      category,
      totalRounds,
      players: playerObjects,
      currentRound: 0,
      usedQuestionIds: [],
      status: 'active'
    });

    res.status(201).json({
      success: true,
      data: game
    });
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create game'
    });
  }
};

// Get game by ID
const getGame = async (req, res) => {
  try {
    const { id } = req.params;

    const game = await Game.findById(id);

    if (!game) {
      return res.status(404).json({
        success: false,
        error: 'Game not found'
      });
    }

    res.json({
      success: true,
      data: game
    });
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch game'
    });
  }
};

// Get next round data (player and question)
const getNextRound = async (req, res) => {
  try {
    const { id } = req.params;

    const game = await Game.findById(id);

    if (!game) {
      return res.status(404).json({
        success: false,
        error: 'Game not found'
      });
    }

    if (game.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Game is already completed'
      });
    }

    const nextRoundNumber = game.currentRound + 1;

    if (nextRoundNumber > game.totalRounds) {
      return res.status(400).json({
        success: false,
        error: 'All rounds completed'
      });
    }

    // Select player for hot seat (rotating through players)
    const playerIndex = (nextRoundNumber - 1) % game.players.length;
    const hotSeatPlayer = game.players[playerIndex];

    // Get a random question not used in this game
    const excludeQuery = game.usedQuestionIds.length > 0
      ? { _id: { $nin: game.usedQuestionIds } }
      : {};

    const questions = await Question.aggregate([
      { $match: { category: game.category, ...excludeQuery } },
      { $sample: { size: 1 } }
    ]);

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No more questions available'
      });
    }

    const question = questions[0];

    res.json({
      success: true,
      data: {
        roundNumber: nextRoundNumber,
        totalRounds: game.totalRounds,
        hotSeatPlayer: {
          id: hotSeatPlayer._id,
          name: hotSeatPlayer.name
        },
        question: {
          id: question._id,
          text: question.text
        },
        players: game.players
      }
    });
  } catch (error) {
    console.error('Error getting next round:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get next round'
    });
  }
};

// Submit round result
const submitRound = async (req, res) => {
  try {
    const { id } = req.params;
    const { playerId, questionId, points } = req.body;

    // Validate points
    if (![1, 2, 3].includes(points)) {
      return res.status(400).json({
        success: false,
        error: 'Points must be 1, 2, or 3'
      });
    }

    const game = await Game.findById(id);

    if (!game) {
      return res.status(404).json({
        success: false,
        error: 'Game not found'
      });
    }

    if (game.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Game is already completed'
      });
    }

    // Find the player and update their score
    const playerIndex = game.players.findIndex(
      p => p._id.toString() === playerId
    );

    if (playerIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Player not found in this game'
      });
    }

    const player = game.players[playerIndex];

    // Get question text for round record
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    // Create round record
    const round = await Round.create({
      gameId: game._id,
      roundNumber: game.currentRound + 1,
      playerId: player._id,
      playerName: player.name,
      questionId: question._id,
      questionText: question.text,
      points
    });

    // Update game state
    game.players[playerIndex].score += points;
    game.currentRound += 1;
    game.usedQuestionIds.push(questionId);

    // Check if game is completed
    if (game.currentRound >= game.totalRounds) {
      game.status = 'completed';

      // Find winner (player with highest score)
      const winner = game.players.reduce((prev, current) =>
        (prev.score > current.score) ? prev : current
      );
      game.winner = winner.name;
    }

    await game.save();

    res.json({
      success: true,
      data: {
        round,
        game: {
          _id: game._id,
          category: game.category,
          currentRound: game.currentRound,
          totalRounds: game.totalRounds,
          status: game.status,
          players: game.players,
          winner: game.winner
        }
      }
    });
  } catch (error) {
    console.error('Error submitting round:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit round'
    });
  }
};

// Get game history (past completed games)
const getGameHistory = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const games = await Game.find({ status: 'completed' })
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .select('category totalRounds players winner createdAt');

    const total = await Game.countDocuments({ status: 'completed' });

    res.json({
      success: true,
      data: games.map(game => ({
        id: game._id,
        category: game.category,
        totalRounds: game.totalRounds,
        playerCount: game.players.length,
        winner: game.winner,
        date: game.createdAt
      })),
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching game history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch game history'
    });
  }
};

// Get game details with rounds
const getGameDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const game = await Game.findById(id);

    if (!game) {
      return res.status(404).json({
        success: false,
        error: 'Game not found'
      });
    }

    const rounds = await Round.find({ gameId: id })
      .sort({ roundNumber: 1 })
      .select('roundNumber playerName questionText points');

    res.json({
      success: true,
      data: {
        game: {
          id: game._id,
          category: game.category,
          totalRounds: game.totalRounds,
          status: game.status,
          winner: game.winner,
          players: game.players,
          createdAt: game.createdAt
        },
        rounds
      }
    });
  } catch (error) {
    console.error('Error fetching game details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch game details'
    });
  }
};

module.exports = {
  createGame,
  getGame,
  getNextRound,
  submitRound,
  getGameHistory,
  getGameDetails
};
