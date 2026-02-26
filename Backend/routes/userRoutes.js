const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');

// Profile routes - accessible to all authenticated users
router.get(
  '/profile',
  auth,
  UserController.getCurrentUser
);

router.put(
  '/profile',
  auth,
  UserController.updateCurrentUser
);

router.put(
  '/change-password',
  auth,
  UserController.changePassword
);

// Sharing endpoint - accessible to all authenticated users
router.get(
  '/sharing',
  auth,
  UserController.getUsersForSharing
);

// Admin-only routes
router.get(
  '/',
  auth,
  admin,
  UserController.getUsers
);

router.get(
  '/:id',
  auth,
  admin,
  UserController.getUserById
);

router.put(
  '/:id',
  auth,
  admin,
  UserController.updateUser
);

router.delete(
  '/:id',
  auth,
  admin,
  UserController.deleteUser
);

// Route for updating user role (admin only)
router.put(
  '/:id/role',
  auth,
  admin,
  UserController.updateUserRole
);

module.exports = router;