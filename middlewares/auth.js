// middlewares/auth.js
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]; // Format: Bearer <token>
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // isinya { id, role, username, ... }
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};