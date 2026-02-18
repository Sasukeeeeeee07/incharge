const Quiz = require('../models/Quiz');
const { validateQuizStructure } = require('../utils/quizValidation');

// Create Manual Quiz
const createQuiz = async (req, res) => {
  try {
    const { title, description, questions, activeDate, languages, content } = req.body;

    // Validation
    const validation = validateQuizStructure({ questions, content, languages });
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }

    let parsedActiveDate = null;
    if (activeDate) {
      const datePart = new Date(activeDate).toISOString().split('T')[0];
      parsedActiveDate = new Date(`${datePart}T00:00:00.000Z`);
    }

    // Prepare legacy fields from English for backward compatibility
    let legacyTitle = title;
    let legacyDesc = description;
    let legacyQuestions = questions;

    if (content) {
      if (content.en) {
        legacyTitle = content.en.title;
        legacyDesc = content.en.description;
        legacyQuestions = content.en.questions;
      } else if (content.english) {
        legacyTitle = content.english.title;
        legacyDesc = content.english.description;
        legacyQuestions = content.english.questions;
      }
    }

    const newQuiz = await Quiz.create({
      title: legacyTitle,
      description: legacyDesc,
      questions: legacyQuestions,
      languages: languages || ['english'],
      content,
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


// Update Quiz
const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, questions, activeDate, languages, content } = req.body;

    const quiz = await Quiz.findById(id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    // Validate
    const validation = validateQuizStructure({ questions, content, languages });
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }

    if (content) {
      quiz.content = content;
      quiz.markModified('content');
      // Update legacy fields if English version is provided
      if (content.en) {
        quiz.title = content.en.title;
        quiz.description = content.en.description;
        quiz.questions = content.en.questions;
      } else if (content.english) {
        quiz.title = content.english.title;
        quiz.description = content.english.description;
        quiz.questions = content.english.questions;
      }
    }

    if (languages) quiz.languages = languages;
    if (title && !content) quiz.title = title;
    if (description && !content) quiz.description = description;
    if (questions && !content) quiz.questions = questions;
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

    // Final validation check before approval (enforce full content completeness)
    const validation = validateQuizStructure(quiz, true);
    if (!validation.isValid) {
      return res.status(400).json({ error: `Cannot approve incomplete quiz: ${validation.error}` });
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

// Deactivate Quiz
const deactivateQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    if (quiz.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Only ACTIVE quizzes can be deactivated.' });
    }

    quiz.status = 'INACTIVE';
    quiz.activeDate = null; // Clear the active date
    await quiz.save();

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findByIdAndDelete(id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createQuiz,
  updateQuiz,
  getQuizzes,
  getQuizById,
  approveQuiz,
  activateQuiz,
  deactivateQuiz,
  deleteQuiz
};
