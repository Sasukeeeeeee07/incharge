const mongoose = require('mongoose');
require('dotenv').config();
const Quiz = require('../src/models/Quiz');

const run = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/incharge-incontrol';
    await mongoose.connect(MONGO_URI);
    
    // Find the quiz with date 2026-01-28
    const targetDate = new Date('2026-01-28T00:00:00.000Z');
    
    const quiz = await Quiz.findOne({ 
      // Look for the one in my logs (ID: 6979b7dafdea92a52f610245 or by date)
      // I'll search by date to be safe
      activeDate: targetDate
    });

    if (!quiz) {
      console.log('Quiz not found for target date.');
      process.exit(1);
    }

    console.log(`Found Quiz: ${quiz.title} (Status: ${quiz.status})`);
    
    quiz.status = 'ACTIVE';
    // Ensure activeDate is set if missing (it appeared correct in logs though)
    quiz.activeDate = targetDate; 
    
    await quiz.save();
    console.log(`Updated Quiz "${quiz.title}" to ACTIVE.`);

    process.exit();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

run();
