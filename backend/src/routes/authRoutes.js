const express = require('express');
const { login, updatePassword, checkAuth, logout } = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', auth, checkAuth);
router.post('/update-password', auth, updatePassword);

module.exports = router;
