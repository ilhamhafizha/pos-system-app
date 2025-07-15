require('dotenv').config();
const multer = require("multer");
const express = require('express');
const cors = require('cors');

const app = express();
const path = require("path");
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROUTES
const authRouter = require('./routes/auth');
app.use('/auth', authRouter);

const dashboardRouter = require('./routes/dashboard');
app.use('/admin/dashboard', dashboardRouter);

const catalogRoutes = require('./routes/catalogs');
app.use('/admin/catalogs', catalogRoutes);

const adminOrderRoutes = require('./routes/adminOrder');
app.use('/admin', adminOrderRoutes);

const adminSettingsRoute = require('./routes/adminSettings');
app.use('/admin/settings', adminSettingsRoute);

const adminSalesReport = require('./routes/adminSalesReport');
app.use('/admin', adminSalesReport);

const cashierDashboardRouter = require('./routes/cashierDashboard');
app.use('/cashier/dashboard', cashierDashboardRouter);

const cashierSalesReportRoutes = require('./routes/cashierSalesReport');
app.use('/cashier/', cashierSalesReportRoutes);

const cashierSettingsRoute = require('./routes/cashierSettings');
app.use('/cashier/settings', cashierSettingsRoute);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
