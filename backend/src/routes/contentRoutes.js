const express = require('express');
const { getLanguages, getTranslations, upsertTranslation } = require('../controllers/contentController');
const { auth, admin } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/languages', getLanguages);
router.get('/translations', getTranslations);

// Admin routes
router.post('/translations', auth, admin, upsertTranslation);

module.exports = router;
