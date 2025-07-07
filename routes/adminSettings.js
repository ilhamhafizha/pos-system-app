const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { User } = require('../models');
const bcrypt = require('bcryptjs');

// GET /admin/settings → Ambil profil admin
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: [
        'email',
        'username',
        'name',
        'role',
        'avatar',
        'status',
        'language',
        'createdAt',
        'updatedAt'
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// PUT /admin/settings → Update profil admin
router.put('/', auth, async (req, res) => {
  try {
    const { name, email, username, avatar, status, language } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({ name, email, username, avatar, status, language });

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        language: user.language,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// PUT /admin/settings/password → Ganti password
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // ⛔ Jangan hash manual di sini, biar model handle-nya
    await user.update({ password: newPassword });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

module.exports = router;
