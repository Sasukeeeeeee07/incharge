const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const LanguageSchema = new mongoose.Schema({
    code: String,
    name: String,
    nativeName: String,
    isActive: Boolean
});
const Language = mongoose.model('Language', LanguageSchema);

const QuizSchema = new mongoose.Schema({}, { strict: false });
const Quiz = mongoose.model('Quiz', QuizSchema);

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const languages = await Language.find({});
        console.log('--- Languages Collection ---');
        languages.forEach(l => console.log(`${l.name} (${l.nativeName}): code='${l.code}'`));

        const quizzes = await Quiz.find({});
        console.log('\n--- Quizzes Collection (Content Keys) ---');
        quizzes.forEach(q => {
            console.log(`Quiz: ${q.title}`);
            if (q.content) {
                console.log('  Content Keys:', Object.keys(q.content));
            } else {
                console.log('  No content field');
            }
            console.log('  Languages Array:', q.languages);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkData();
