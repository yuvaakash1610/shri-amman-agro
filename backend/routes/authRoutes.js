const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.post('/login', authController.login);
router.post('/register', authController.register);

// Protected route for getting current user's profile
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;
