const express = require('express');
const multer = require('multer');
const { bulkImport, getUsers } = require('../controllers/adminController');
const { auth, admin } = require('../middleware/auth');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.use(auth, admin);

router.post('/import', upload.single('file'), bulkImport);
router.get('/users', getUsers);

module.exports = router;
