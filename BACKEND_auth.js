import jwt from 'jsonwebtoken';
import { config } from './BACKEND_env.js';

/**
 * JWT Authentication Middleware
 * 
 * Validates JWT token from Authorization header
 * Sets req.user with decoded token payload
 * 
 * Usage:
 * router.get('/protected', authenticateToken, handler)
 * 
 * Expected header:
 * Authorization: Bearer <JWT_TOKEN>
 * 
 * On success: req.user = { id, email, role, exp, iat }
 * On failure: 401 Unauthorized
 */
export const authenticateToken = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN" -> TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required',
      error: 'NO_TOKEN'
    });
  }

  try {
    // Verify and decode token
    const user = jwt.verify(token, config.jwtSecret, {
      algorithms: ['HS256']
    });

    // Attach user info to request
    req.user = user;
    next();
  } catch (error) {
    // Handle different JWT errors
    let message = 'Invalid token';
    let statusCode = 403;

    if (error.name === 'TokenExpiredError') {
      message = 'Token has expired';
      statusCode = 401;
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Invalid token';
      statusCode = 403;
    }

    return res.status(statusCode).json({
      success: false,
      message,
      error: error.name,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Admin-only Middleware
 * Use after authenticateToken to ensure user is admin
 * 
 * Usage:
 * router.post('/admin-action', authenticateToken, requireAdmin, handler)
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin privileges required'
    });
  }

  next();
};

export default { authenticateToken, requireAdmin };
