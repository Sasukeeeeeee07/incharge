const mongoose = require('mongoose');
require('dotenv').config();
const Quiz = require('./src/models/Quiz');

const run = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/incharge-incontrol';
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    // 1. List ALL Quizzes nicely
    const allQuizzes = await Quiz.find({});
    console.log(`\nFound ${allQuizzes.length} total quizzes in DB.`);
    
    allQuizzes.forEach(q => {
      console.log(`\n------------------------------------------------`);
      console.log(`ID:       ${q._id}`);
      console.log(`Title:    ${q.title}`);
      console.log(`Status:   ${q.status}`);
      console.log(`ActiveDt: ${q.activeDate} (Raw: ${q.activeDate ? q.activeDate.toISOString() : 'null'})`);
      console.log(`IsActive: ${q.isActive} (Deprecated field check)`);
    });

    // 2. Simulate User Query EXACTLY as written in controller
    console.log(`\n------------------------------------------------`);
    console.log('--- SIMULATING USER QUERY ---');
    
    const now = new Date();
    const datePart = now.toISOString().split('T')[0]; 
    const startOfToday = new Date(`${datePart}T00:00:00.000Z`);
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    console.log(`Query Range (UTC):`);
    console.log(`Start: ${startOfToday.toISOString()}`);
    console.log(`End:   ${endOfToday.toISOString()}`);

    const matchedQuiz = await Quiz.findOne({ 
      status: 'ACTIVE', 
      activeDate: { $gte: startOfToday, $lt: endOfToday } 
    });

    console.log(`\nResult: ${matchedQuiz ? 'MATCH FOUND: ' + matchedQuiz.title : 'NO MATCH FOUND'}`);

    process.exit();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

run();
