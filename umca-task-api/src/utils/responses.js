/**
 * Standardized API response utilities
 * Ensures consistent response format across all endpoints
 */

/**
 * Success response with data
 */
export function successResponse(data, statusCode = 200) {
  return {
    status: statusCode,
    body: {
      success: true,
      data,
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Error response
 */
export function errorResponse(code, message, statusCode = 400, details = null) {
  return {
    status: statusCode,
    body: {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
        timestamp: new Date().toISOString()
      }
    }
  };
}

/**
 * Authentication error responses
 */
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: () => errorResponse(
    'INVALID_CREDENTIALS',
    'Invalid username or password',
    401
  ),
  
  TOKEN_REQUIRED: () => errorResponse(
    'TOKEN_REQUIRED',
    'Authorization token is required',
    401
  ),
  
  TOKEN_INVALID: () => errorResponse(
    'TOKEN_INVALID',
    'Invalid or malformed authorization token',
    401
  ),
  
  TOKEN_EXPIRED: () => errorResponse(
    'TOKEN_EXPIRED',
    'Authorization token has expired',
    401
  ),
  
  REFRESH_TOKEN_INVALID: () => errorResponse(
    'REFRESH_TOKEN_INVALID',
    'Invalid or expired refresh token',
    401
  ),
  
  USER_EXISTS: (field) => errorResponse(
    'USER_EXISTS',
    `User with this ${field} already exists`,
    409
  ),
  
  RATE_LIMIT: () => errorResponse(
    'RATE_LIMIT_EXCEEDED',
    'Too many requests. Please try again later',
    429
  )
};

/**
 * Send JSON response with consistent format
 */
export function sendResponse(res, responseData) {
  const { status, body } = responseData;
  return res.status(status).json(body);
}