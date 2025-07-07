const express = require('express');
const router = express.Router();
const { TransactionGroup, TransactionItem, Catalog } = require('../models');
const { Op } = require('sequelize');

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

router.get('/top-category', async (req, res) => {
  try {
    const items = await TransactionItem.findAll({
      include: {
        model: Catalog,
        attributes: ['category']
      }
    });

    // Hitung total quantity per kategori
    const categoryCount = {};

    items.forEach(item => {
      const category = item.Catalog.category;
      if (!categoryCount[category]) {
        categoryCount[category] = 0;
      }
      categoryCount[category] += item.quantity;
    });

    // Ubah ke array dan sort descending
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