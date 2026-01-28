const { generateQuizDraft } = require('./aiService');
const Quiz = require('../models/Quiz');

const initScheduler = () => {
  console.log('Daily Quiz Scheduler Initialized...');

  // Check immediately on startup (optional, maybe good for dev/testing)
  checkAndGenerateDailyQuiz();

  // Check every hour
  setInterval(checkAndGenerateDailyQuiz, 60 * 60 * 1000); 
};

const checkAndGenerateDailyQuiz = async () => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Check if ANY draft or Generated quiz exists created today
    const existingDraft = await Quiz.findOne({
      generatedBy: 'AI',
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existingDraft) {
      console.log('Scheduler: AI Quiz for today already exists. Skipping.');
      return;
    }

    console.log('Scheduler: Generating new daily AI quiz...');
    const draft = await generateQuizDraft();

    const title = draft.title || `Daily AI Quiz - ${new Date().toISOString().split('T')[0]}`;
    const description = draft.description || "Automatically generated daily quiz.";

    await Quiz.create({
      title,
      description,
      questions: draft.questions,
      status: 'DRAFT',
      generatedBy: 'AI',
      requiresAdminApproval: true
    });

    console.log('Scheduler: Daily Quiz Draft Created Successfully.');

  } catch (error) {
    console.error('Scheduler Error:', error.message);
  }
};

module.exports = { initScheduler };
