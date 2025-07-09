const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const dashboardCashier = require('../controllers/dashboardCashier');

// List menu
router.get('/menus', auth('cashier'), dashboardCashier.getMenuList);

// Buat transaksi baru
router.post('/orders', auth('cashier'), dashboardCashier.createTransactionGroup);

module.exports = router;
