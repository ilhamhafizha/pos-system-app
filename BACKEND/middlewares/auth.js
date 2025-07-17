const jwt = require('jsonwebtoken');

function auth(role) {
  return function (req, res, next) {
    // Ambil token dari header atau query
    const token =
      req.headers.authorization?.split(' ')[1] || req.query.token;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      // Cek role jika diperlukan
      if (role && req.user.role !== role) {
        return res.status(403).json({ message: 'Forbidden: Access denied' });
      }

      next();
    } catch (err) {
      res.status(401).json({ message: 'Invalid token' });
    }
  };
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
