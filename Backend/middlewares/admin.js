const admin = async (req, res, next) => {
  try {
    if (!req.user.role || req.user.role.name !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = admin; 