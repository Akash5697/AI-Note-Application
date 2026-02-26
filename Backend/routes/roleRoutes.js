const express = require('express');
const router = express.Router();
const RoleController = require('../controllers/roleController');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');

// Apply auth and admin middleware to all routes
router.use(auth);
router.use(admin);

// Get all roles
router.get(
  '/',
  RoleController.getRoles
);

// Create role
router.post(
  '/',
  RoleController.createRole
);

// Get role statistics
router.get(
  '/statistics',
  RoleController.getRoleStatistics
);

// Bulk update user roles
router.put(
  '/bulk-update',
  RoleController.bulkUpdateUserRoles
);

// Get users by role type
router.get(
  '/users/:roleType',
  RoleController.getUsersByRoleType
);

// Get role by ID
router.get(
  '/:id',
  RoleController.getRoleById
);

// Update role
router.put(
  '/:id',
  RoleController.updateRole
);

// Delete role
router.delete(
  '/:id',
  RoleController.deleteRole
);

module.exports = router;