const jwt = require('jsonwebtoken');

/**
 * Verifies a JWT and returns the decoded payload
 * @param {string} token - The JWT token
 * @returns {object} decoded - The decoded token payload
 * @throws {Error} - If token is invalid or expired
 */
const verifyToken = (token) => {
  if (!token) {
    throw new Error('Token is missing');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
};

module.exports = verifyToken;
