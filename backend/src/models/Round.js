const mongoose = require('mongoose');

const roundSchema = new mongoose.Schema({
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: [true, 'Game ID is required'],
    index: true
  },
  roundNumber: {
    type: Number,
    required: [true, 'Round number is required'],
    min: 1
  },
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Player ID is required']
  },
  playerName: {
    type: String,
    required: [true, 'Player name is required']
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: [true, 'Question ID is required']
  },
  questionText: {
    type: String,
    required: [true, 'Question text is required']
  },
  points: {
    type: Number,
    required: [true, 'Points are required'],
    enum: [1, 2, 3]
  }
}, {
  timestamps: true
});

// Compound index for efficient querying
roundSchema.index({ gameId: 1, roundNumber: 1 });

module.exports = mongoose.model('Round', roundSchema);
