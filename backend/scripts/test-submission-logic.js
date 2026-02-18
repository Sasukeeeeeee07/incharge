require('dotenv').config();
const mongoose = require('mongoose');
const Quiz = require('../src/models/Quiz');
const QuizAttempt = require('../src/models/QuizAttempt');
const User = require('../src/models/User');

const testSubmission = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb+srv://incharge:smmart@incharge.nsk5cmh.mongodb.net/?appName=incharge';
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        // 1. Get Active Quiz
        const quiz = await Quiz.findOne({ title: { $regex: 'Leadership', $options: 'i' } });
        if (!quiz) throw new Error('No quiz found');
        console.log('Quiz found:', quiz.title, quiz._id);

        // 2. Get a User
        const user = await User.findOne({});
        if (!user) throw new Error('No user found');
        console.log('User found:', user.email, user._id);

        // 3. Mock Responses (Take first 2 questions)
        const questions = [];
        if (quiz.content && quiz.content.get('english')) {
            quiz.content.get('english').questions.forEach(q => questions.push(q));
        } else {
            quiz.questions.forEach(q => questions.push(q));
        }

        const responses = questions.map(q => ({
            questionId: q._id, // Ensure this exists
            answerType: "In-Charge"
        }));

        console.log('Constructed Responses:', responses.length);
        console.log('Sample Response:', responses[0]);

        // 4. Mimic Controller Logic
        console.log('--- STARTING CONTROLLER LOGIC SIMULATION ---');

        const quizId = quiz._id.toString();
        const userId = user._id.toString();

        let attempt = await QuizAttempt.findOne({ userId, quizId });
        console.log('Existing attempt:', attempt ? 'Found' : 'Null');

        // Logic check: normalization
        let inCharge = 0;
        let inControl = 0;

        responses.forEach((resp, index) => {
            const rawType = (resp.answerType || '').trim().toLowerCase();
            if (rawType === 'in-charge') inCharge++;
            else if (rawType === 'in-control') inControl++;
            else console.warn(`Invalid type at ${index}: ${rawType}`);
        });

        let result = 'Balanced';
        if (inCharge > inControl) result = 'In-Charge';
        else if (inControl > inCharge) result = 'In-Control';

        if (!attempt) {
            attempt = new QuizAttempt({ userId, quizId });
            console.log('Created new attempt instance');
        }

        const normalizedResponses = responses.map(r => {
            const raw = (r.answerType || '').toLowerCase().replace(/[\s-]/g, '');
            let type = r.answerType;
            if (raw.includes('incharge')) type = 'In-Charge';
            else if (raw.includes('incontrol')) type = 'In-Control';

            return {
                questionId: r.questionId,
                answerType: type
            };
        });

        attempt.responses = normalizedResponses;
        attempt.score = { inCharge, inControl };
        attempt.result = result;
        attempt.language = 'english';
        attempt.status = 'completed';
        attempt.completedAt = new Date();

        console.log('Attempt ready to save. Validating...');
        await attempt.validate();
        console.log('Validation successful.');

        // Note: We won't save to avoid messing up data, or we can save and then delete.
        // Let's just validate. 500 usually happens at save/validate.

        console.log('Test PASSED: Logic and Schema are compatible.');

    } catch (err) {
        console.error('Test FAILED:', err);
        if (err.errors) {
            Object.keys(err.errors).forEach(key => {
                console.error(`Validation Error [${key}]:`, err.errors[key].message);
            });
        }
    } finally {
        await mongoose.disconnect();
    }
};

testSubmission();
