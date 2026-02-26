require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,

  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiration: process.env.JWT_EXPIRATION || '24h',
  nodeEnv: process.env.NODE_ENV || 'development'
}; 