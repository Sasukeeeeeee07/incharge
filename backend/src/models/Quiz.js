const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  questions: [{
    questionText: { type: String, required: true },
    options: [{
      text: { type: String, required: true },
      type: { type: String, enum: ['In-Charge', 'In-Control'], required: true }
    }]
  }],
  activeDate: { type: Date, unique: true }, // One active quiz per day
  isActive: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
