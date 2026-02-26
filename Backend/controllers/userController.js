const userService = require('../services/userService');

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await userService.getCurrentUser(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCurrentUser = async (req, res) => {
  try {
    const user = await userService.updateCurrentUser(req.user.id, req.body);
    res.json(user);
  } catch (error) {
    if (error.message === 'User not found') return res.status(404).json({ message: error.message });
    res.status(500).json({ message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    const result = await userService.changePassword(req.user.id, currentPassword, newPassword);
    res.json(result);
  } catch (error) {
    if (error.message === 'Current password is incorrect') return res.status(400).json({ message: error.message });
    res.status(500).json({ message: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const result = await userService.getUsers(startDate, endDate, limit, offset);

    res.set({
      'X-Filter-Applied': startDate || endDate ? 'true' : 'false',
      'X-Date-Range': startDate && endDate ? `${startDate} to ${endDate}` : (startDate ? `from ${startDate}` : (endDate ? `to ${endDate}` : 'none')),
      'X-Total-Count': result.totalItems.toString()
    });

    res.json(result);
  } catch (error) {
    console.error('Error in getUsers:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json(user);
  } catch (error) {
    if (error.message === 'User not found') return res.status(404).json({ message: error.message });
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    res.json(user);
  } catch (error) {
    if (error.message === 'User not found') return res.status(404).json({ message: error.message });
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    res.json({ message: 'User removed' });
  } catch (error) {
    if (error.message === 'User not found') return res.status(404).json({ message: error.message });
    res.status(500).json({ message: error.message });
  }
};

exports.getUsersForSharing = async (req, res) => {
  try {
    const users = await userService.getUsersForSharing();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const user = await userService.updateUserRole(req.params.id, req.body.roleId);
    res.json(user);
  } catch (error) {
    if (error.message === 'User not found') return res.status(404).json({ message: error.message });
    res.status(500).json({ message: error.message });
  }
};