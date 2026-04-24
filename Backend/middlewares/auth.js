const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { getDb, ObjectId } = require('../config/db');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const db = getDb();
    
    // Use aggregation to include role
    const pipeline = [
      { $match: { _id: new ObjectId(decoded.id), deletedAt: null } },
      {
        $lookup: {
          from: 'roles',
          localField: 'roleId',
          foreignField: '_id',
          as: 'role'
        }
      },
      { $unwind: { path: '$role', preserveNullAndEmptyArrays: true } },
      { $project: { password: 0 } }
    ];

    const results = await db.collection('users').aggregate(pipeline).toArray();
    const user = results[0];

    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    // Map _id to id for consistency in req.user
    user.id = user._id.toString();
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;