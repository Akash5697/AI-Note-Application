const config = require('../config/config');

const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    const statusCode = err.status || 500;
    const message = err.message || 'Something went wrong!';

    res.status(statusCode).json({
        message,
        error: config.nodeEnv === 'development' ? err : {}
    });
};

module.exports = errorHandler;
