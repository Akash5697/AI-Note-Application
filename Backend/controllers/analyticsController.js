const analyticsService = require('../services/analyticsService');

exports.getMostActiveUsers = async (req, res) => {
  try {
    const activeUsers = await analyticsService.getMostActiveUsers();
    res.json(activeUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMostUsedTags = async (req, res) => {
  try {
    const popularTags = await analyticsService.getMostUsedTags();
    res.json(popularTags);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getNotesPerDay = async (req, res) => {
  try {
    const notesPerDay = await analyticsService.getNotesPerDay();
    res.json(notesPerDay);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAnalyticsSummary = async (req, res) => {
  try {
    const summary = await analyticsService.getAnalyticsSummary();
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};