/**
 * Centralized Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
    console.error('[SERVER_ERROR]:', err);

    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';

    res.status(status).json({
        success: false,
        message: message,
        // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = errorHandler;
