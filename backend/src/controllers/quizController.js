const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');

// Get active quiz for today
const getActiveQuiz = async (req, res) => {
  try {
    const today = new Date().setHours(0, 0, 0, 0);
    const quiz = await Quiz.findOne({ 
      isActive: true, 
      activeDate: { $gte: today, $lt: new Date(today).setDate(new Date(today).getDate() + 1) } 
    });

    if (!quiz) {
      return res.status(404).json({ error: 'No active quiz for today' });
    }

    // Check if user already attempted
    const attempt = await QuizAttempt.findOne({ userId: req.user.id, quizId: quiz._id });
    if (attempt) {
      return res.status(403).json({ error: 'Quiz already attempted', attempt });
    }

    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Submit quiz responses
const submitQuiz = async (req, res) => {
  const { quizId, responses } = req.body;
  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    // Enforce one attempt
    const existingAttempt = await QuizAttempt.findOne({ userId: req.user.id, quizId });
    if (existingAttempt) return res.status(403).json({ error: 'Already attempted' });

    let inCharge = 0;
    let inControl = 0;

    responses.forEach(resp => {
      if (resp.answerType === 'In-Charge') inCharge++;
      else if (resp.answerType === 'In-Control') inControl++;
    });

    let result = 'Balanced';
    if (inCharge > 5) result = 'In-Charge';
    else if (inControl > 5) result = 'In-Control';

    const attempt = await QuizAttempt.create({
      userId: req.user.id,
      quizId,
      responses,
      score: { inCharge, inControl },
      result
    });

    res.json(attempt);
  } catch (err) {
    res.status(500).json({ error: 'Submission failed' });
  }
};

module.exports = { getActiveQuiz, submitQuiz };
