const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/analyticsController');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');

// Apply auth and admin middleware to all routes
router.use(auth);
router.use(admin);

// Most active users
router.get(
  '/active-users',
  AnalyticsController.getMostActiveUsers
);

// Most used tags
router.get(
  '/popular-tags',
  AnalyticsController.getMostUsedTags
);

// Notes created per day
router.get(
  '/notes-per-day',
  AnalyticsController.getNotesPerDay
);

// Analytics summary
router.get(
  '/summary',
  AnalyticsController.getAnalyticsSummary
);

module.exports = router;