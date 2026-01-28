const express = require('express');
const multer = require('multer');
const { bulkImport, getUsers, exportUsers } = require('../controllers/adminController');
const { 
  createQuiz, 
  generateAIGeneratedQuiz, 
  updateQuiz, 
  getQuizzes, 
  getQuizById,
  approveQuiz, 
  activateQuiz 
} = require('../controllers/quizAdminController');
const { getAnalytics } = require('../controllers/analyticsController');
const { auth, admin } = require('../middleware/auth');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.use(auth, admin);

// User Management
router.post('/import', upload.single('file'), bulkImport);
router.get('/users', getUsers);
router.get('/export', exportUsers);

// Analytics
router.get('/analytics', getAnalytics);

// Quiz Management
router.post('/quizzes', createQuiz); // Manual Create
router.post('/quizzes/generate-ai', generateAIGeneratedQuiz); // AI Generate
router.get('/quizzes', getQuizzes); // List
router.get('/quizzes/:id', getQuizById); // Detail
router.put('/quizzes/:id', updateQuiz); // Update
router.put('/quizzes/:id/approve', approveQuiz); // Approve
router.put('/quizzes/:id/activate', activateQuiz); // Activate

module.exports = router;
