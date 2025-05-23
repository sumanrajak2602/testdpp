// middleware/error.js
const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
      success: false,
      error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message
    });
  };
  
  module.exports = errorHandler;