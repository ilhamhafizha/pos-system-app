const express = require('express');
const router = express.Router();
const { TransactionGroup, TransactionItem, Catalog, sequelize } = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const { auth, authorizeRole } = require('../middlewares/auth');


router.get('/', auth, authorizeRole('admin'), async (req, res) => {
  try {
    // Total Orders
    const totalOrders = await TransactionGroup.count();

    // Total Omzet
    const orders = await TransactionGroup.findAll();
    const totalOmzet = orders.reduce((sum, order) => sum + order.total, 0);

    // Semua item menu yang terjual (allMenuOrders)
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
        dataCategory.deserts += item.quantity; // typo handle
      }

      allMenuOrders += item.quantity;
    });

    res.json({
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
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// Chart: Total subtotal transaksi per hari
router.get('/omzet', auth, authorizeRole('admin'), async (req, res) => {
  try {
    const items = await TransactionItem.findAll({
      include: [
        {
          model: TransactionGroup,
          attributes: ['createdAt']
        },
        {
          model: Catalog,
          attributes: ['category']
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

    res.json({
      message: 'Admin omzet accessed successfully',
      success: true,
      data: result
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

router.get('/chart', auth, authorizeRole('admin'), async (req, res) => {
  try {
    const items = await TransactionItem.findAll({
      include: {
        model: TransactionGroup,
        attributes: [],
      },
      attributes: [
        [fn('DATE', col('TransactionGroup.createdAt')), 'date'],
        [fn('SUM', col('subtotal')), 'total']
      ],
      group: [fn('DATE', col('TransactionGroup.createdAt'))],
      raw: true
    });

    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// Summary: total order & total omset hari ini
router.get('/summary', auth, authorizeRole('admin'), async (req, res) => {
  try {
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

    res.json({ totalOrder, totalOmset });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// Top Category: berdasarkan quantity
router.get('/top-category', auth, authorizeRole('admin'), async (req, res) => {
  try {
    const items = await TransactionItem.findAll({
      include: {
        model: Catalog,
        attributes: ['category']
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

    res.json(sorted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

module.exports = router;
