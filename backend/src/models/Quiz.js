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
  status: { 
    type: String, 
    enum: ['DRAFT', 'APPROVED', 'ACTIVE', 'ARCHIVED'], 
    default: 'DRAFT' 
  },
  generatedBy: { 
    type: String, 
    enum: ['MANUAL', 'AI'], 
    default: 'MANUAL' 
  },
  requiresAdminApproval: { type: Boolean, default: false },
  activeDate: { type: Date } // Unique enforcement moved to controller logic to allow drafts
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
