import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export const generateToken = (payload) => {
  try {
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiry
    });
  } catch (error) {
    throw new Error(`Token generation failed: ${error.message}`);
  }
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
};

export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    throw new Error(`Token decode failed: ${error.message}`);
  }
};

export default {
  generateToken,
  verifyToken,
  decodeToken
};
