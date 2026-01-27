const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  responses: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    answerType: { type: String, enum: ['In-Charge', 'In-Control'], required: true }
  }],
  score: {
    inCharge: { type: Number, default: 0 },
    inControl: { type: Number, default: 0 }
  },
  result: { type: String, enum: ['In-Charge', 'In-Control', 'Balanced'] },
  completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Ensure one attempt per user per quiz
quizAttemptSchema.index({ userId: 1, quizId: 1 }, { unique: true });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
