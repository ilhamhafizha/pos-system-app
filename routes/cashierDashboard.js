const express = require('express');
const router = express.Router();
const { auth, authorizeRole } = require('../middlewares/auth');
const dashboardCashier = require('../controllers/dashboardCashier');

// List menu
router.get('/menus', auth('cashier'), dashboardCashier.getMenuList);

// Buat transaksi baru
router.post('/orders', auth('cashier'), dashboardCashier.createTransactionGroup);

router.post(
  '/orders/:transactionGroupId/items',
  auth('cashier'),
  dashboardCashier.addItemToTransaction
);

router.delete(
  '/orders/:transactionItemId/items',
  auth('cashier'),
  dashboardCashier.deleteItemFromTransaction
);

router.put(
  '/orders/:transactionGroupId/pay',

  auth('cashier'),
  dashboardCashier.processPayment
);


module.exports = router;
