const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error.issues) {
      return res.status(400).json({
        success: false,
        message: 'Input validation failed',
        errors: error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Malformed request body',
    });
  }
};

module.exports = validate;
