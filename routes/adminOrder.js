const express = require('express');
const router = express.Router();
const { TransactionGroup, TransactionItem, Catalog } = require('../models');

router.get('/orders', async (req, res) => {
  try {
    const orders = await TransactionGroup.findAll({
      include: [
        {
          model: TransactionItem,
          include: [
            {
              model: Catalog,
              attributes: ['name', 'category', 'price']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

router.get('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const order = await TransactionGroup.findByPk(id, {
      include: [
        {
          model: TransactionItem,
          include: [
            {
              model: Catalog,
              attributes: ['name', 'category', 'price']
            }
          ]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});


module.exports = router;
