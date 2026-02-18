const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  languages: [{ type: String, default: ['english'] }],
  content: {
    type: Map,
    of: {
      title: { type: String },
      description: { type: String },
      questions: [{
        questionText: { type: String, required: true },
        options: [{
          text: { type: String, required: true },
          // STRICT RULE: Field MUST be 'answerType'. 'type' is reserved/legacy and BANNED.
          answerType: { type: String, enum: ['In-Charge', 'In-Control'], required: true }
        }]
      }]
    }
  },
  // Legacy fields (kept for safety but should not optionally override core logic)
  title: { type: String },
  description: { type: String },
  questions: [{
    questionText: { type: String },
    options: [{
      text: { type: String },
      answerType: { type: String, enum: ['In-Charge', 'In-Control'] }
    }]
  }],
  status: {
    type: String,
    enum: ['DRAFT', 'APPROVED', 'ACTIVE', 'ARCHIVED', 'INACTIVE'],
    default: 'DRAFT'
  },
  generatedBy: {
    type: String,
    enum: ['MANUAL', 'AI'],
    default: 'MANUAL'
  },
  requiresAdminApproval: { type: Boolean, default: false },
  activeDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
