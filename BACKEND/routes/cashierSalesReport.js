const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');

// ✅ Import semua fungsi dari controller salesCashier.js
const {
  getSalesReport,                 // GET /sales-report?filter&export
  getSalesDetailByOrderNumber,   // GET /sales-report/:orderNumber
  getSalesSummary,               // GET /sales-summary
  getTopMenusByCategory,         // GET /sales-summary/category/:category
  getListTotalOrder,             // GET /sales-report/total-order
  getListTotalOmzet,             // GET /sales-report/total-omzet
  getListAllMenuSales            // GET /sales-report/all-menu-sales
} = require('../controllers/salesCashier');

// ✅ Laporan utama (dengan filter + export Excel/PDF)
router.get('/sales-report', auth('cashier'), getSalesReport);

// ✅ Detail transaksi berdasarkan nomor order
router.get('/sales-report/:orderNumber', auth('cashier'), getSalesDetailByOrderNumber);

// ✅ Ringkasan total order, omzet, dan penjualan menu
router.get('/sales-summary', auth('cashier'), getSalesSummary);

// ✅ Top menu berdasarkan kategori (foods, beverages, dessert, dll)
router.get('/sales-summary/category/:category', auth('cashier'), getTopMenusByCategory);

// ✅ Daftar total order transaksi
router.get('/sales-report/total-order', auth('cashier'), getListTotalOrder);

// ✅ Daftar omzet transaksi
router.get('/sales-report/total-omzet', auth('cashier'), getListTotalOmzet);

// ✅ Semua penjualan menu (jumlah, kategori, subtotal)
router.get('/sales-report/all-menu-sales', auth('cashier'), getListAllMenuSales);

module.exports = router;
