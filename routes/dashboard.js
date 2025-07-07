const express = require('express');
const router = express.Router();
const { TransactionGroup, TransactionItem, Catalog, sequelize } = require('../models');
const { Op, fn, col } = require('sequelize');

// Summary: total order & total omset hari ini
router.get('/summary', async (req, res) => {
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
router.get('/top-category', async (req, res) => {
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

// Chart: Total subtotal transaksi per hari
router.get('/chart', async (req, res) => {
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

module.exports = router;
