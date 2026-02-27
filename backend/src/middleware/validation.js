/**
 * Generic Validation Middleware
 * Uses Zod to validate request body fields
 */
const validate = (schema) => (req, res, next) => {
    try {
        // Validate request body
        const validatedBody = schema.parse(req.body);

        // Replace req.body with validated and transformed data
        req.body = validatedBody;
        next();
    } catch (error) {
        if (error.errors) {
            // Zod formatted error
            return res.status(400).json({
                success: false,
                message: 'Input validation failed',
                errors: error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            });
        }

        res.status(400).json({
            success: false,
            message: 'Malformed request body'
        });
    }
};

module.exports = validate;
