const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Friends', 'Date', 'Family', 'Deep', 'Funny'],
    index: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Question', questionSchema);
