const Joi = require("joi");

const bodyValidator = (schema) => {
  return (req, res, next) => {
    // Debug logging for file uploads and route
    console.log('VALIDATOR DEBUG: req.file:', req.file);
    console.log('VALIDATOR DEBUG: req.body:', req.body);
    console.log('VALIDATOR DEBUG: req.originalUrl:', req.originalUrl, 'req.method:', req.method);

    // Loosened route check for portfolio image upload
    if (
      req.file &&
      req.originalUrl.includes("/photographers/portfolio/images") &&
      req.method === "POST"
    ) {
      return next();
    }

    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map((detail) => ({
        message: detail.message,
        path: detail.path,
      }));
      return res.status(400).json({ errors });
    }

    next();
  };
};

module.exports = bodyValidator;
