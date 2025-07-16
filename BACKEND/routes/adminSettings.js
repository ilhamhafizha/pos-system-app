const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { auth } = require('../middlewares/auth');

// Konfigurasi multer untuk avatar
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `admin-avatar-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

/* =======================================================
✅ GET /admin/settings → Ambil profil admin
======================================================= */
router.get('/', auth('admin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: [
        'email', 'username', 'name', 'role',
        'avatar', 'status', 'language',
        'createdAt', 'updatedAt'
      ]
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

/* =======================================================
✅ PUT /admin/settings → Update profil admin
======================================================= */
router.put('/', auth('admin'), async (req, res) => {
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

/* =======================================================
✅ PUT /admin/settings/password → Ganti password admin
======================================================= */
router.put('/password', auth('admin'), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    user.password = newPassword; // ⛔ Biarkan Sequelize yang hash
    await user.save();           // ✅ Trigger hook

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

/* =======================================================
✅ PATCH /admin/settings/avatar → Upload avatar admin
======================================================= */
router.patch('/avatar', auth('admin'), upload.single('avatar'), async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // Hapus avatar lama jika ada
    if (user.avatar) {
      const oldPath = path.join(__dirname, '..', user.avatar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const filePath = `uploads/${req.file.filename}`;
    await user.update({ avatar: filePath });

    res.json({ message: "Avatar uploaded successfully", avatar: filePath });
  } catch (error) {
    console.error("Upload avatar error:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

/* =======================================================
✅ PATCH /admin/settings/avatar/delete → Hapus avatar admin
======================================================= */
router.patch('/avatar/delete', auth('admin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Hapus avatar lama jika ada
    if (user.avatar) {
      const oldPath = path.join(__dirname, '..', user.avatar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await user.update({ avatar: null });

    res.json({ message: "Avatar deleted successfully" });
  } catch (error) {
    console.error("Delete avatar error:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

module.exports = router;