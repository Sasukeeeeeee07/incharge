require('dotenv').config();
const mongoose = require('mongoose');
const QuizAttempt = require('../src/models/QuizAttempt');

const resetAttempt = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb+srv://incharge:smmart@incharge.nsk5cmh.mongodb.net/?appName=incharge';
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const userId = '6993ff6b398632f0b2a4be43';
        const quizId = '6993ff6b398632f0b2a4be48';

        const result = await QuizAttempt.deleteOne({ userId, quizId });
        console.log('Deleted attempt:', result);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
};

resetAttempt();
