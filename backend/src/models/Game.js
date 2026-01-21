const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Player name is required'],
    trim: true
  },
  score: {
    type: Number,
    default: 0
  }
}, { _id: true });

const gameSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Friends', 'Date', 'Family', 'Deep', 'Funny']
  },
  totalRounds: {
    type: Number,
    required: [true, 'Total rounds is required'],
    min: 1,
    max: 20
  },
  currentRound: {
    type: Number,
    default: 0
  },
  players: {
    type: [playerSchema],
    validate: {
      validator: function(v) {
        return v.length >= 2 && v.length <= 8;
      },
      message: 'A game must have between 2 and 8 players'
    }
  },
  usedQuestionIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  },
  winner: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for querying games by status and date
gameSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Game', gameSchema);
