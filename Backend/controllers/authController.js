const authService = require('../services/authService');

exports.register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    if (error.message === 'User already exists') {
      return res.status(400).json({ message: error.message });
    }
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (error) {
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({ message: error.message });
    }
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const result = await authService.getMe(req.user.id);
    res.json(result);
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const result = await authService.forgotPassword(email);
    res.json(result);
  } catch (error) {
    if (error.message === 'User with this email does not exist') {
      return res.status(404).json({ message: error.message });
    }
    console.error('ForgotPassword error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }
    const result = await authService.resetPassword(token, password);
    res.json(result);
  } catch (error) {
    if (error.message === 'Invalid or expired token') {
      return res.status(400).json({ message: error.message });
    }
    console.error('ResetPassword error:', error);
    res.status(500).json({ message: error.message });
  }
};