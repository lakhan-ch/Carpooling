const { verifyToken } = require('../utils/jwtUtils');

/**
 * requireAuth middleware — validates JWT from Authorization header or cookie.
 * Attaches decoded user payload to req.user.
 */
function requireAuth(req, res, next) {
  try {
    // Support both Bearer token and httpOnly cookie
    const authHeader = req.headers.authorization;
    const token =
      (authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : null) || req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const decoded = verifyToken(token);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

/**
 * requireDriver middleware — ensures the authenticated user has a driver role.
 */
function requireDriver(req, res, next) {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized.' });
  if (req.user.role !== 'DRIVER' && req.user.role !== 'BOTH') {
    return res.status(403).json({ message: 'Driver access required.' });
  }
  next();
}

/**
 * requireRider middleware — ensures the authenticated user has a rider role.
 */
function requireRider(req, res, next) {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized.' });
  if (req.user.role !== 'RIDER' && req.user.role !== 'BOTH') {
    return res.status(403).json({ message: 'Rider access required.' });
  }
  next();
}

module.exports = { requireAuth, requireDriver, requireRider };
