const express = require("express");
const router = express.Router();
const { User } = require("../models");
const bcrypt = require("bcryptjs");
const { auth } = require("../middlewares/auth");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// 🟢 STORAGE KONFIGURASI MULTER
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

/* ===============================================
✅ GET /cashier/settings → Ambil profil cashier
================================================= */
router.get("/", auth("cashier"), async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: [
        "email",
        "username",
        "name",
        "role",
        "avatar",
        "status",
        "language",
        "createdAt",
        "updatedAt",
      ],
    });

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

/* ===============================================
✅ PUT /cashier/settings → Update profil cashier
================================================= */
router.put("/", auth("cashier"), async (req, res) => {
  try {
    const { username, language } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.update({ username, language });

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        language: user.language,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

/* =======================================================
✅ PUT /cashier/settings/password → Update password HASHED
========================================================= */
router.put('/password', auth('cashier'), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    user.password = newPassword; // Biarkan hook beforeUpdate yang hash
    await user.save();           // ✅ Trigger hook

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password update error:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});



/* =======================================================
✅ PATCH /cashier/settings/avatar → Upload avatar
========================================================= */
router.patch("/avatar", auth("cashier"), upload.single("avatar"), async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // Delete old avatar if exists
    if (user.avatar) {
      const oldPath = path.join(__dirname, "..", user.avatar);
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
✅ PATCH /cashier/settings/avatar/delete → Hapus avatar
========================================================= */
router.patch("/avatar/delete", auth("cashier"), async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Delete old avatar if exists
    if (user.avatar) {
      const oldPath = path.join(__dirname, "..", user.avatar);
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