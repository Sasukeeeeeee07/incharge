const express = require('express');
const multer = require('multer');
const { bulkImport, getUsers, exportUsers, updateUser, createUsers, deleteUser, resetUserPassword } = require('../controllers/adminController');
const {
  createQuiz,
  updateQuiz,
  getQuizzes,
  getQuizById,
  approveQuiz,
  activateQuiz,
  deactivateQuiz,
  deleteQuiz
} = require('../controllers/quizAdminController');
const { getAnalytics, getUserHistory, getAttemptDetails } = require('../controllers/analyticsController');
const { auth, admin } = require('../middleware/auth');
const router = express.Router();

const path = require('path');
const upload = multer({ dest: '/tmp/keval-uploads/' });

router.use(auth, admin);

// User Management
router.post('/import', upload.single('file'), bulkImport);
router.get('/users', getUsers);
router.post('/users', createUsers);
router.put('/users/:userId', updateUser);
router.put('/users/:userId/reset-password', resetUserPassword);
router.delete('/users/:userId', deleteUser);
router.get('/export', exportUsers);

// Analytics
router.get('/analytics', getAnalytics);
router.get('/users/:userId/history', getUserHistory);
router.get('/attempts/:attemptId/details', getAttemptDetails);

// Quiz Management
router.post('/quizzes', createQuiz); // Manual Create

router.get('/quizzes', getQuizzes); // List
router.get('/quizzes/:id', getQuizById); // Detail
router.put('/quizzes/:id', updateQuiz); // Update
router.put('/quizzes/:id/approve', approveQuiz); // Approve
router.put('/quizzes/:id/activate', activateQuiz); // Activate
router.put('/quizzes/:id/deactivate', deactivateQuiz); // Deactivate
router.delete('/quizzes/:id', deleteQuiz); // Delete

module.exports = router;
