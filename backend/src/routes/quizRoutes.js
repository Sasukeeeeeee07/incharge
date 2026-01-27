const express = require('express');
const { getActiveQuiz, submitQuiz } = require('../controllers/quizController');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.use(auth);

router.get('/active', getActiveQuiz);
router.post('/submit', submitQuiz);

module.exports = router;
