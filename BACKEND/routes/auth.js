const express = require('express');
const router = express.Router();
const { User } = require('../models');
const jwt = require('jsonwebtoken');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const foundUser = await User.findOne({ where: { email } });
    if (!foundUser) return res.status(404).json({ message: 'User not found' });

    const valid = await foundUser.validatePassword(password);
    if (!valid) return res.status(401).json({ message: 'Invalid password' });

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'JWT secret is not set' });
    }

    const token = jwt.sign({
      id: foundUser.id,
      role: foundUser.role,
      username: foundUser.username
    }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: foundUser.id,
        role: foundUser.role,
        username: foundUser.username,
        email: foundUser.email,
        avatar: foundUser.avatar || null // ⬅️ tambahkan ini
      }
    });


  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, username, email, password, confirmPassword, active } = req.body; // ✅ perbaikan

    // Validasi input
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    // Cek apakah email sudah digunakan
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use.' });
    }

    // Buat user baru sebagai cashier
    const newUser = await User.create({
      name,
      username,
      email,
      password,
      role: 'cashier',
      active: true,       // kirim dari FE atau hardcode
      status: 'active'
    });

    return res.status(201).json({
      message: 'Registration successful. You can now log in.',
      user: {
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        avatar: newUser.avatar || null // ⬅️ jika ada
      }
    });

  } catch (error) {
    console.error("❌ REGISTER ERROR:", error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});


router.post('/reset-password/email', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ where: { email, role: 'cashier' } });
    if (!user) return res.status(404).json({ message: 'Cashier not found with that email' });

    return res.status(200).json({
      message: 'Reset Password email success',
      success: true
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/reset-password/confirm', async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    // Validasi input kosong
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validasi kesamaan password
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Cek apakah user cashier ditemukan
    const user = await User.findOne({ where: { email, role: 'cashier' } });
    if (!user) {
      return res.status(404).json({ message: 'Cashier not found with that email' });
    }

    // Update password dengan individualHooks agar beforeUpdate terpanggil
    await User.update(
      { password }, // password belum di-hash di sini
      {
        where: { email, role: 'cashier' },
        individualHooks: true // ⬅️ WAJIB agar beforeUpdate hash otomatis
      }
    );

    return res.status(200).json({
      message: 'Reset Password update success',
      success: true
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});



module.exports = router;
