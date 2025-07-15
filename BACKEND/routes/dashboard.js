const express = require('express');
const router = express.Router();
const { TransactionGroup, TransactionItem, Catalog } = require('../models');
const { Op, fn, col } = require('sequelize');
const { auth } = require('../middlewares/auth');

// Dashboard Utama
router.get('/', auth('admin'), async (req, res) => {
  try {
    console.log('📊 GET /admin/dashboard');

    // Total Orders
    const totalOrders = await TransactionGroup.count();
    console.log('Total Orders:', totalOrders);

    // Total Omzet
    const orders = await TransactionGroup.findAll();
    const totalOmzet = orders.reduce((sum, order) => sum + order.total, 0);
    console.log('Total Omzet:', totalOmzet);

    // Semua item menu yang terjual
    const allItems = await TransactionItem.findAll({
      include: {
        model: Catalog,
        attributes: ['category']
      }
    });

    const dataCategory = {
      foods: 0,
      beverages: 0,
      deserts: 0,
    };

    let allMenuOrders = 0;

    allItems.forEach(item => {
      const category = item.Catalog.category;

      if (category === 'foods') {
        dataCategory.foods += item.quantity;
      } else if (category === 'beverages') {
        dataCategory.beverages += item.quantity;
      } else if (category === 'dessert' || category === 'deserts') {
        dataCategory.deserts += item.quantity;
      }

      allMenuOrders += item.quantity;
    });

    return res.json({
      message: 'Admin dashboard accessed successfully',
      success: true,
      data: {
        totalOrders,
        totalOmzet,
        allMenuOrders,
        ...dataCategory
      }
    });
  } catch (error) {
    console.error('🔥 Error /dashboard:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
});

// Chart per hari: jumlah item berdasarkan kategori
router.get('/omzet', auth('admin'), async (req, res) => {
  try {
    console.log('📊 GET /admin/dashboard/omzet');

    const items = await TransactionItem.findAll({
      include: [
        {
          model: TransactionGroup,
          attributes: ['createdAt'],
          required: true
        },
        {
          model: Catalog,
          attributes: ['category'],
          required: true
        }
      ],
      raw: true
    });

    const chartMap = {};

    for (const item of items) {
      const date = new Date(item['TransactionGroup.createdAt']).toLocaleDateString('id-ID');
      const category = item['Catalog.category'];
      const qty = item.quantity;

      if (!chartMap[date]) {
        chartMap[date] = {
          date,
          foods: 0,
          beverages: 0,
          deserts: 0
        };
      }

      if (category === 'foods') {
        chartMap[date].foods += qty;
      } else if (category === 'beverages') {
        chartMap[date].beverages += qty;
      } else if (category === 'dessert' || category === 'deserts') {
        chartMap[date].deserts += qty;
      }
    }

    const result = Object.values(chartMap);

    return res.json({
      message: 'Admin omzet accessed successfully',
      success: true,
      data: result
    });

  } catch (error) {
    console.error('🔥 Error /omzet:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
});

// Chart per hari: omzet total per tanggal
router.get('/chart', auth('admin'), async (req, res) => {
  try {
    console.log('📊 GET /admin/dashboard/chart');

    const items = await TransactionItem.findAll({
      include: {
        model: TransactionGroup,
        attributes: [],
        required: true
      },
      attributes: [
        [fn('DATE', col('TransactionGroup.createdAt')), 'date'],
        [fn('SUM', col('subtotal')), 'total']
      ],
      group: [fn('DATE', col('TransactionGroup.createdAt'))],
      raw: true
    });

    return res.json(items);
  } catch (error) {
    console.error('🔥 Error /chart:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
});

// Summary hari ini
router.get('/summary', auth('admin'), async (req, res) => {
  try {
    console.log('📊 GET /admin/dashboard/summary');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const ordersToday = await TransactionGroup.findAll({
      where: {
        createdAt: {
          [Op.gte]: today
        }
      }
    });

    const totalOrder = ordersToday.length;
    const totalOmset = ordersToday.reduce((sum, order) => sum + order.total, 0);

    return res.json({ totalOrder, totalOmset });
  } catch (error) {
    console.error('🔥 Error /summary:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
});

// Top kategori berdasarkan quantity
router.get('/top-category', auth('admin'), async (req, res) => {
  try {
    console.log('📊 GET /admin/dashboard/top-category');

    const items = await TransactionItem.findAll({
      include: {
        model: Catalog,
        attributes: ['category'],
        required: true
      }
    });

    const categoryCount = {};

    items.forEach(item => {
      const category = item.Catalog.category;
      if (!categoryCount[category]) {
        categoryCount[category] = 0;
      }
      categoryCount[category] += item.quantity;
    });

    const sorted = Object.entries(categoryCount)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);

    return res.json(sorted);
  } catch (error) {
    console.error('🔥 Error /top-category:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
});

module.exports = router;
