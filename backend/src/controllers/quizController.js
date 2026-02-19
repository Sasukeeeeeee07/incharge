const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');

// Get active quiz for today
const getActiveQuiz = async (req, res) => {
  try {
    const now = new Date();
    const datePart = now.toISOString().split('T')[0];
    const startOfToday = new Date(`${datePart}T00:00:00.000Z`);
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    const quiz = await Quiz.findOne({
      status: 'ACTIVE',
      activeDate: { $lte: endOfToday }
    }).sort({ activeDate: -1 });

    if (!quiz) {
      return res.status(404).json({ error: 'No active quiz' });
    }

    const attempt = await QuizAttempt.findOne({ userId: req.user.id, quizId: quiz._id });
    const quizJson = quiz.toJSON({ flattenMaps: true });

    const isCompleted = attempt && attempt.status === 'completed';

    res.json({
      quiz: quizJson,
      alreadyAttempted: isCompleted,
      attempt: attempt || null
    });
  } catch (err) {
    console.error('Error fetching quiz:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Save in-progress quiz state
const saveProgress = async (req, res) => {
  const { quizId, responses, currentStep, currentQuestionIndex, language } = req.body;
  try {
    let attempt = await QuizAttempt.findOne({ userId: req.user.id, quizId });

    if (!attempt) {
      attempt = new QuizAttempt({
        userId: req.user.id,
        quizId,
        responses,
        // currentStep, (Legacy removed)
        currentQuestionIndex,
        language: language || 'english',
        status: 'started'
      });
    } else {
      if (attempt.status === 'completed') {
        return res.status(403).json({ error: 'Quiz already completed' });
      }
      attempt.responses = responses;
      // attempt.currentStep = currentStep; (Legacy removed)
      attempt.currentQuestionIndex = currentQuestionIndex;
      attempt.language = language || attempt.language;
    }

    await attempt.save();
    res.json(attempt);
  } catch (err) {
    console.error('Save progress error:', err);
    res.status(500).json({ error: 'Failed to save progress', details: err.message });
  }
};

// Submit quiz responses
const submitQuiz = async (req, res) => {
  const { quizId, responses, language } = req.body;
  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const existingAttempt = await QuizAttempt.findOne({ userId: req.user.id, quizId });
    if (existingAttempt && existingAttempt.status === 'completed') {
      return res.status(403).json({ error: 'Already attempted' });
    }

    let inCharge = 0;
    let inControl = 0;

    const normalizedResponses = [];

    responses.forEach((resp) => {
      const raw = (resp.answerType || '').toLowerCase().replace(/[^a-z]/g, '');
      let type = null;

      if (raw.includes('charge')) {
        type = 'In-Charge';
        inCharge++;
      } else if (raw.includes('control')) {
        type = 'In-Control';
        inControl++;
      } else {
        type = 'In-Charge';
        inCharge++;
      }

      normalizedResponses.push({
        questionId: resp.questionId,
        answerType: type
      });
    });

    let result = 'Balanced';
    if (inCharge > inControl) {
      result = 'In-Charge';
    } else if (inControl > inCharge) {
      result = 'In-Control';
    }

    const attempt = await QuizAttempt.findOneAndUpdate(
      { userId: req.user.id, quizId },
      {
        $set: {
          responses: normalizedResponses,
          score: { inCharge, inControl },
          result: result,
          language: language || 'english',
          status: 'completed',
          completedAt: new Date()
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    );

    res.json(attempt);
  } catch (err) {
    console.error('SUBMISSION CRITICAL ERROR:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ error: 'Validation Error', details: messages });
    }
    res.status(500).json({ error: 'Submission failed', details: err.message });
  }
};

const getQuizHistory = async (req, res) => {
  try {
    const history = await QuizAttempt.find({ userId: req.user.id })
      .populate('quizId', 'content title activeDate')
      .sort({ completedAt: -1 });

    const formattedHistory = history.map(attempt => {
      let quizTitle = 'Untitled Quiz';
      if (attempt.quizId) {
        if (attempt.quizId.content) {
          const langKeys = Array.from(attempt.quizId.content.keys());
          if (langKeys.length > 0) {
            quizTitle = attempt.quizId.content.get(langKeys[0]).title;
          }
        } else if (attempt.quizId.title) {
          quizTitle = attempt.quizId.title;
        }
      }

      return {
        _id: attempt._id,
        quizId: attempt.quizId?._id,
        quizTitle,
        date: attempt.completedAt,
        result: attempt.result,
        score: attempt.score,
        responses: attempt.responses,
        language: attempt.language,
        quizContent: attempt.quizId?.content || null,
        quizQuestions: attempt.quizId?.questions || []
      };
    });

    res.json(formattedHistory);
  } catch (err) {
    console.error('Error fetching quiz history:', err);
    res.status(500).json({ error: 'Server error fetching history' });
  }
};

module.exports = { getActiveQuiz, submitQuiz, getQuizHistory, saveProgress };
