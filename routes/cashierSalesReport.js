const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const { getSalesReport } = require('../controllers/salesCashier');

// GET /cashier/sales-report
router.get('/sales-report', auth('cashier'), getSalesReport);

module.exports = router;
