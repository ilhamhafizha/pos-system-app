const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');

// ✅ Import kedua fungsi controller
const {
  getSalesReport,
  getSalesDetailByOrderNumber,
  getSalesSummary,
  getTopMenusByCategory,
  getListTotalOrder,
  getListTotalOmzet,
  getListAllMenuSales

} = require('../controllers/salesCashier');

// ✅ Routenya tetap
router.get('/sales-report', auth('cashier'), getSalesReport);

// routes/cashierSalesReport.js
router.get('/sales-summary', auth('cashier'), getSalesSummary);
router.get('/sales-report/total-order', auth('cashier'), getListTotalOrder);
router.get('/sales-report/total-omzet', auth('cashier'), getListTotalOmzet);
router.get('/sales-report/all-menu-sales', auth('cashier'), getListAllMenuSales);
router.get('/sales-summary/category/:category', auth('cashier'), getTopMenusByCategory);
router.get('/sales-report/:orderNumber', auth('cashier'), getSalesDetailByOrderNumber);

module.exports = router;
