const express = require('express');
const router = express.Router();
const { User } = require('../models');
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const foundUser = await User.findOne({ where: { email } });
    if (!foundUser) return res.status(404).json({ message: 'User not found' });

    const valid = await foundUser.validatePassword(password);
    if (!valid) return res.status(401).json({ message: 'Invalid password' });

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'JWT secret is not set in environment variables' });
    }

    const token = jwt.sign({
      id: foundUser.id,
      role: foundUser.role,
      username: foundUser.username
    }, process.env.JWT_SECRET);

    res.json({
      token,
      success: true,
      user: {
        id: foundUser.id,
        role: foundUser.role,
        name: foundUser.name
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

module.exports = router;

