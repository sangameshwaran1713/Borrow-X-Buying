const { z } = require('zod');

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  phone: z.string().min(10, 'Mandatory phone number (min 10 digits) required for anti-fraud security'),
  address: z.string().optional(),
  bio: z.string().optional(),
  profileImage: z.string().min(1, 'Mandatory bank-grade live selfie photo required for verification'),
  isLiveSelfie: z.boolean().optional(),
  coordinates: z.object({
    longitude: z.number().or(z.string()).optional(),
    latitude: z.number().or(z.string()).optional(),
    isLiveGPS: z.boolean().optional()
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
