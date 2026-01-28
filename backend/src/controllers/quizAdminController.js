const Quiz = require('../models/Quiz');
const { generateQuizDraft } = require('../services/aiService');
const { validateQuizStructure } = require('../utils/quizValidation');

// Create Manual Quiz
const createQuiz = async (req, res) => {
  try {
    const { title, description, questions, activeDate } = req.body;

    // Strict Validation
    const validation = validateQuizStructure({ questions });
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }

    let parsedActiveDate = null;
    if (activeDate) {
      const datePart = new Date(activeDate).toISOString().split('T')[0];
      parsedActiveDate = new Date(`${datePart}T00:00:00.000Z`);
    }

    const newQuiz = await Quiz.create({
      title,
      description,
      questions,
      activeDate: parsedActiveDate,
      status: 'DRAFT',
      generatedBy: 'MANUAL',
      requiresAdminApproval: true 
    });

    res.status(201).json(newQuiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Generate with AI
const generateAIGeneratedQuiz = async (req, res) => {
  try {
    const draft = await generateQuizDraft(); 
    
    // Add default title/desc if missing from AI
    const title = draft.title || `AI Generated Quiz - ${new Date().toISOString().split('T')[0]}`;
    const description = draft.description || "Automatically generated quiz draft.";

    const newQuiz = await Quiz.create({
      title,
      description,
      questions: draft.questions,
      status: 'DRAFT',
      generatedBy: 'AI',
      requiresAdminApproval: true
    });

    res.status(201).json(newQuiz);
  } catch (error) {
    res.status(500).json({ error: "AI Generation failed: " + error.message });
  }
};

// Update Quiz (Draft only)
const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, questions, activeDate } = req.body;

    const quiz = await Quiz.findById(id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    if (quiz.status === 'ACTIVE') {
      return res.status(400).json({ error: 'Cannot edit an ACTIVE quiz. Deactivate it first.' });
    }

    // Validate if questions are being updated
    if (questions) {
      const validation = validateQuizStructure({ questions });
      if (!validation.isValid) {
        return res.status(400).json({ error: validation.error });
      }
      quiz.questions = questions;
    }

    if (title) quiz.title = title;
    if (description) quiz.description = description;
    if (activeDate !== undefined) {
      if (activeDate) {
        const datePart = new Date(activeDate).toISOString().split('T')[0];
        quiz.activeDate = new Date(`${datePart}T00:00:00.000Z`);
      } else {
        quiz.activeDate = null;
      }
    }

    await quiz.save();
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// List Quizzes
const getQuizzes = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const quizzes = await Quiz.find(query).sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Approve Quiz
const approveQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findById(id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    if (quiz.status !== 'DRAFT') {
      return res.status(400).json({ error: 'Only DRAFT quizzes can be approved.' });
    }

    // Final validation check before approval
    const validation = validateQuizStructure({ questions: quiz.questions });
    if (!validation.isValid) {
      return res.status(400).json({ error: `Cannot approve invalid quiz: ${validation.error}` });
    }

    quiz.status = 'APPROVED';
    await quiz.save();
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Activate Quiz
const activateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { activeDate } = req.body; 

    if (!activeDate) {
      return res.status(400).json({ error: 'Active date is required.' });
    }

    // Normalize to UTC midnight to avoid timezone issues
    const datePart = new Date(activeDate).toISOString().split('T')[0]; // Ensure YYYY-MM-DD
    const targetDate = new Date(`${datePart}T00:00:00.000Z`);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const quiz = await Quiz.findById(id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    if (quiz.status !== 'DRAFT' && quiz.status !== 'APPROVED' && quiz.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Quiz must be DRAFT or APPROVED before activation.' });
    }

    // Check if another quiz is active for this date
    const existingActive = await Quiz.findOne({
      status: 'ACTIVE',
      _id: { $ne: id }, // Exclude self if already active
      activeDate: { $gte: targetDate, $lt: nextDay }
    });

    if (existingActive) {
      return res.status(409).json({ error: `Another quiz is already active for ${new Date(activeDate).toDateString()}.` });
    }

    quiz.status = 'ACTIVE';
    quiz.activeDate = targetDate;
    await quiz.save();

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createQuiz,
  generateAIGeneratedQuiz,
  updateQuiz,
  getQuizzes,
  getQuizById,
  approveQuiz,
  activateQuiz
};
