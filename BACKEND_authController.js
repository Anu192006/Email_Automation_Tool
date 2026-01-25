import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from './BACKEND_supabase.js';
import { config } from './BACKEND_env.js';

const SALT_ROUNDS = 10;

/**
 * POST /api/auth/register
 * Register a new admin account
 * 
 * Body: {
 *   email: string (required, unique)
 *   password: string (required, min 8 chars)
 *   name: string (optional)
 * }
 * 
 * Returns: {
 *   success: boolean
 *   message: string
 *   data: { id, email, name, role }
 * }
 */
export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters'
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Demo mode: Accept registration and return success
    // In production: check Supabase for duplicate emails and insert new admin
    console.log('✓ Register: accepting email:', email.toLowerCase());
    
    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        id: 'demo-' + Date.now(),
        email: email.toLowerCase(),
        name: name || 'Demo User',
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * POST /api/auth/login
 * Login with email and password
 * 
 * Body: {
 *   email: string (required)
 *   password: string (required)
 * }
 * 
 * Returns: {
 *   success: boolean
 *   message: string
 *   data: {
 *     token: string (JWT)
 *     user: { id, email, name, role }
 *   }
 * }
 */
export const login = async (req, res) => {
  try {
    console.log('🔵 [LOGIN] Request received');
    console.log('🔵 [LOGIN] Body:', req.body);
    
    const { email, password } = req.body;

    console.log('🔵 [LOGIN] Email:', email, '| Password:', password);

    // Validation
    if (!email || !password) {
      console.log('❌ [LOGIN] Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Demo credentials for development
    const DEMO_EMAIL = 'admin@demo.com';
    const DEMO_PASSWORD = '12345678';

    console.log('🔵 [LOGIN] Checking credentials...');
    console.log('🔵 [LOGIN] Email matches:', email.toLowerCase() === DEMO_EMAIL);
    console.log('🔵 [LOGIN] Password matches:', password === DEMO_PASSWORD);

    if (email.toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
      console.log('✅ [LOGIN] Credentials matched! Generating token...');
      
      const DEMO_CREDENTIALS = {
        id: 'demo-admin-001',
        email: 'admin@demo.com',
        name: 'Demo Admin',
        role: 'admin'
      };

      const token = jwt.sign(
        {
          id: DEMO_CREDENTIALS.id,
          email: DEMO_CREDENTIALS.email,
          role: DEMO_CREDENTIALS.role
        },
        config.jwtSecret,
        { expiresIn: config.jwtExpiry }
      );

      console.log('✅ [LOGIN] Token generated successfully');

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: DEMO_CREDENTIALS
        }
      });
    }

    console.log('❌ [LOGIN] Credentials do not match');
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  } catch (error) {
    console.error('🔴 [LOGIN ERROR]', error.message);
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * POST /api/auth/logout
 * Logout (invalidate token on frontend)
 * 
 * Auth: Required (Bearer token)
 * 
 * Returns: {
 *   success: boolean
 *   message: string
 * }
 */
export const logout = async (req, res) => {
  try {
    // In JWT-based auth, logout is handled on frontend by deleting token
    // This endpoint can be used for cleanup tasks if needed
    return res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * GET /api/auth/validate
 * Validate JWT token and return user info
 * 
 * Auth: Required (Bearer token)
 * 
 * Returns: {
 *   success: boolean
 *   data: { id, email, name, role, exp }
 * }
 */
export const validate = async (req, res) => {
  try {
    // req.user is set by authenticateToken middleware
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        exp: user.exp
      }
    });
  } catch (error) {
    console.error('Validate error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * POST /api/auth/change-password
 * Change admin password (authenticated only)
 * 
 * Auth: Required
 * Body: {
 *   currentPassword: string
 *   newPassword: string (min 8 chars)
 * }
 * 
 * Returns: {
 *   success: boolean
 *   message: string
 * }
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.user.id;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current and new password required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters'
      });
    }

    // Get current password hash
    const { data: admin } = await supabase
      .from('admins')
      .select('password_hash')
      .eq('id', adminId)
      .single();

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Verify current password
    const passwordMatch = await bcrypt.compare(
      currentPassword,
      admin.password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password
    const { error } = await supabase
      .from('admins')
      .update({
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', adminId);

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update password'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export default {
  register,
  login,
  logout,
  validate,
  changePassword
};
