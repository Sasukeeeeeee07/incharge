const mongoose = require('mongoose');

const translationSchema = new mongoose.Schema({
    languageCode: { type: String, required: true, index: true }, // e.g., 'en'
    key: { type: String, required: true, index: true }, // e.g., 'welcome_message', 'start_btn'
    value: { type: String, required: true }, // e.g., 'Welcome', 'Start Quiz'
    section: { type: String, default: 'general' } // e.g., 'auth', 'quiz', 'nav'
}, { timestamps: true });

// Compound index for unique key per language
translationSchema.index({ languageCode: 1, key: 1 }, { unique: true });

module.exports = mongoose.model('Translation', translationSchema);
