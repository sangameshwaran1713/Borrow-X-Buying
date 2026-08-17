const { z } = require('zod');

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  phone: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().optional(),
  coordinates: z.object({
    longitude: z.number().or(z.string()).optional(),
    latitude: z.number().or(z.string()).optional()
  }).optional()
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

const verify2FASchema = z.object({
  token: z.string().length(6, '2FA token must be 6 digits')
});

const validateRequest = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: err.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
      });
    }
    next(err);
  }
};

module.exports = {
  registerSchema,
  loginSchema,
  verify2FASchema,
  validateRequest
};
