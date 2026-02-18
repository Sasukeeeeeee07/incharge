require('dotenv').config();
const mongoose = require('mongoose');
const Quiz = require('../src/models/Quiz');

const inspectQuiz = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb+srv://incharge:smmart@incharge.nsk5cmh.mongodb.net/?appName=incharge';
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const now = new Date();
        const datePart = now.toISOString().split('T')[0];
        const startOfToday = new Date(`${datePart}T00:00:00.000Z`);
        const endOfToday = new Date(startOfToday);
        endOfToday.setDate(endOfToday.getDate() + 1);

        const quiz = await Quiz.findOne({
            status: 'ACTIVE',
            activeDate: { $lte: endOfToday }
        }).sort({ activeDate: -1 });

        if (!quiz) {
            console.log('No active quiz found.');
        } else {
            console.log('Found Active Quiz:', quiz.title);
            console.log('ID:', quiz._id);

            console.log('\n--- Content Inspection ---');
            if (quiz.content) {
                for (const [lang, data] of quiz.content.entries()) {
                    console.log(`Language: ${lang}`);
                    data.questions.forEach((q, i) => {
                        console.log(`  Q${i + 1}: ${q.questionText}`);
                        q.options.forEach((opt, j) => {
                            console.log(`    Option ${j + 1}: Text="${opt.text}", AnswerType="${opt.answerType}"`);
                        });
                    });
                }
            } else {
                console.log('Using Legacy Questions Structure');
                quiz.questions.forEach((q, i) => {
                    console.log(`  Q${i + 1}: ${q.questionText}`);
                    q.options.forEach((opt, j) => {
                        console.log(`    Option ${j + 1}: Text="${opt.text}", AnswerType="${opt.answerType}"`);
                    });
                });
            }
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
};

inspectQuiz();
