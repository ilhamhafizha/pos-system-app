const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]; // Format: Bearer <token>
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // isinya: { id, role, username }
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
}

function authorizeRole(role) {
  return function (req, res, next) {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: 'Forbidden: Access denied' });
    }
    next();
  };
}

module.exports = {
  auth,
  authorizeRole
};
