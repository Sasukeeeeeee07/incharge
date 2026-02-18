const mongoose = require('mongoose');

const languageSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true }, // e.g., 'en', 'hi'
    name: { type: String, required: true }, // e.g., 'English', 'Hindi'
    nativeName: { type: String, required: true }, // e.g., 'English', 'हिंदी'
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Language', languageSchema);
