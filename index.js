const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
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

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
