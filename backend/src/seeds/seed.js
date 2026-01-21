require('dotenv').config();
const mongoose = require('mongoose');
const { Question } = require('../models');
const questionsData = require('./questionsData');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hotseat';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing questions
    await Question.deleteMany({});
    console.log('Cleared existing questions');

    // Insert new questions
    const insertedQuestions = await Question.insertMany(questionsData);
    console.log(`Inserted ${insertedQuestions.length} questions`);

    // Display count by category
    const categories = ['Friends', 'Date', 'Family', 'Deep', 'Funny'];
    for (const category of categories) {
      const count = await Question.countDocuments({ category });
      console.log(`  ${category}: ${count} questions`);
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
