const express = require('express');
const router = express.Router();
const AiController = require('../controllers/aiController');
const auth = require('../middlewares/auth');

// Apply auth middleware to all AI routes
router.use(auth);

// Generate content
router.post(
  '/generate',
  AiController.generateNoteContent
);

// Enhance content
router.post(
  '/enhance',
  AiController.enhanceNoteContent
);

// Generate tags
router.post(
  '/tags',
  AiController.generateTags
);

// Generate template
router.post(
  '/template',
  AiController.generateTemplate
);

// Get writing suggestions
router.post(
  '/suggestions',
  AiController.getWritingSuggestions
);

// Status check
router.get(
  '/status',
  AiController.getAiStatus
);

// Get workspace briefing
router.post(
  '/briefing',
  AiController.getWorkspaceBriefing
);

// Get AI usage stats (Admin handled inside controller logic)
router.get(
  '/stats',
  AiController.getAiStats
);

// Error handling middleware for AI routes
router.use((error, req, res, next) => {
  console.error('AI Route Error:', error);

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Invalid request data',
      success: false
    });
  }

  if (error.code === 'ECONNABORTED') {
    return res.status(408).json({
      message: 'Request timeout. Please try again.',
      success: false
    });
  }

  res.status(500).json({
    message: 'An unexpected error occurred',
    success: false
  });
});

module.exports = router;
