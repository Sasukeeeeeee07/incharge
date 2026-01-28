const mongoose = require('mongoose');
require('dotenv').config();
const Quiz = require('./src/models/Quiz');

const run = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/incharge-incontrol';
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    // 1. Check all ACTIVE quizzes
    const activeQuizzes = await Quiz.find({ status: 'ACTIVE' });
    console.log('--- ALL ACTIVE QUIZZES ---');
    activeQuizzes.forEach(q => {
      console.log(`ID: ${q._id}, Title: ${q.title}, ActiveDate: ${q.activeDate} (Type: ${typeof q.activeDate}), ISO: ${q.activeDate ? q.activeDate.toISOString() : 'N/A'}`);
    });

    // 2. Simulate User Query
    const todayTimestamp = new Date().setHours(0, 0, 0, 0);
    const todayDate = new Date(todayTimestamp);
    
    const nextDayTimestamp = new Date(todayTimestamp).setDate(todayDate.getDate() + 1);
    const nextDayDate = new Date(nextDayTimestamp);

    console.log('\n--- QUERY PARAMETERS ---');
    console.log(`Local Now: ${new Date().toString()}`);
    console.log(`Start Limit (Today 00:00 Local): ${todayDate.toString()} | ISO: ${todayDate.toISOString()}`);
    console.log(`End Limit (Tomrw 00:00 Local): ${nextDayDate.toString()} | ISO: ${nextDayDate.toISOString()}`);

    const matchedQuiz = await Quiz.findOne({ 
      status: 'ACTIVE', 
      activeDate: { $gte: todayTimestamp, $lt: nextDayTimestamp } 
    });

    console.log('\n--- QUERY RESULT ---');
    console.log(matchedQuiz ? `Found: ${matchedQuiz.title}` : 'No Quiz Found');

    process.exit();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

run();
