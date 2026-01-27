const express = require('express');
const { login, updatePassword } = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.post('/login', login);
router.post('/update-password', auth, updatePassword);

module.exports = router;
