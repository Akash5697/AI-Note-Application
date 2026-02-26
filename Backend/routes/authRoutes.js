const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const auth = require('../middlewares/auth');
const validateDto = require('../dtos/validateDto');
const authDto = require('../dtos/authDto');

// Public routes
router.post(
    '/register',
    [validateDto(authDto.registerDto)],
    AuthController.register
);

router.post(
    '/login',
    [validateDto(authDto.loginDto)],
    AuthController.login
);

// Protected routes
router.get(
    '/me',
    auth,
    AuthController.getMe
);

module.exports = router;
