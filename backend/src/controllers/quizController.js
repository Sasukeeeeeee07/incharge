const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');

// Get active quiz for today
const getActiveQuiz = async (req, res) => {
  try {
    // Get start of today in UTC
    const now = new Date();
    const datePart = now.toISOString().split('T')[0]; // Current UTC date YYYY-MM-DD
    const startOfToday = new Date(`${datePart}T00:00:00.000Z`);
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    const quiz = await Quiz.findOne({ 
      status: 'ACTIVE', 
      activeDate: { $gte: startOfToday, $lt: endOfToday } 
    });

    if (!quiz) {
      return res.status(404).json({ error: 'No active quiz for today' });
    }

    // Check if user already attempted
    const attempt = await QuizAttempt.findOne({ userId: req.user.id, quizId: quiz._id });
    
    // Convert to plain object to allow modification
    const quizObj = quiz.toObject();

    // Shuffle options for each question
    quizObj.questions.forEach(q => {
      for (let i = q.options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [q.options[i], q.options[j]] = [q.options[j], q.options[i]];
      }
    });

    // Return quiz and attempt data
    res.json({
      quiz: quizObj,
      alreadyAttempted: !!attempt,
      attempt: attempt || null
    });
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
