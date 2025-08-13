import Joi from 'joi';

// User registration validation schema
export const registerSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(50)
    .required()
    .messages({
      'string.alphanum': 'Username must contain only alphanumeric characters',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username must not exceed 50 characters',
      'any.required': 'Username is required'
    }),
  
  email: Joi.string()
    .email()
    .max(255)
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.max': 'Email must not exceed 255 characters',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required'
    })
});

// User login validation schema
export const loginSchema = Joi.object({
  username: Joi.string()
    .required()
    .messages({
      'any.required': 'Username is required'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

// Refresh token validation schema
export const refreshTokenSchema = Joi.object({
  refresh_token: Joi.string()
    .required()
    .messages({
      'any.required': 'Refresh token is required'
    })
});

/**
 * Validate request data against schema
 */
export function validateInput(data, schema) {
  const { error, value } = schema.validate(data, { 
    abortEarly: false, // Return all validation errors
    allowUnknown: false, // Reject unknown fields
    stripUnknown: true // Remove unknown fields
  });

  if (error) {
    const validationErrors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));
    
    return {
      valid: false,
      errors: validationErrors
    };
  }

  return {
    valid: true,
    data: value
  };
}

/**
 * Create validation error response
 */
export function createValidationErrorResponse(errors) {
  return {
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Invalid input data',
      details: errors,
      timestamp: new Date().toISOString()
    }
  };
}