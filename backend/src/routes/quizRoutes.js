const express = require('express');
const { getActiveQuiz, submitQuiz, getQuizHistory, saveProgress } = require('../controllers/quizController');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.use(auth);

router.get('/active', getActiveQuiz);
router.put('/progress', saveProgress);
router.post('/submit', submitQuiz);
router.get('/history', getQuizHistory);

module.exports = router;
