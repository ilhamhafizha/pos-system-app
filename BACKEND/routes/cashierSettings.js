const express = require('express');
const router = express.Router();
const { User } = require('../models');
const bcrypt = require('bcryptjs');
const { auth } = require('../middlewares/auth');

// ✅ GET /cashier/settings → Ambil profil cashier
router.get('/', auth('cashier'), async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: [
        'email', 'username', 'name', 'role',
        'avatar', 'status', 'language',
        'createdAt', 'updatedAt'
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

// ✅ PUT /cashier/settings → Update profil cashier
router.put('/', auth('cashier'), async (req, res) => {
  try {
    const { name, email, username, avatar, status, language } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

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

// ✅ PUT /cashier/settings/password → Ganti password
router.put('/password', auth('cashier'), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    await user.update({ password: newPassword });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// ✅ PATCH /cashier/settings/avatar → Hapus foto profile (set avatar = null)
router.patch('/avatar', auth('cashier'), async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({ avatar: null });

    res.json({ message: 'Avatar deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

module.exports = router;