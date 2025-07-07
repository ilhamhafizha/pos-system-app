const express = require('express');
const router = express.Router();
const { TransactionGroup, TransactionItem } = require('../models');

router.post('/order', async (req, res) => {
  const t = await TransactionGroup.sequelize.transaction();

  try {
    const {
      user_id,
      order_number,
      transaction_type,
      customer_name,
      table,
      cash,
      items
    } = req.body;

    const subtotal_group = items.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = Math.round(subtotal_group * 0.1);
    const total = subtotal_group + tax;
    const cashback = cash - total;

    const transactionGroup = await TransactionGroup.create({
      user_id,
      order_number,
      transaction_type,
      customer_name,
      table,
      subtotal_group,
      tax,
      total,
      cash,
      cashback
    }, { transaction: t });

    const transactionItems = items.map(item => ({
      transaction_group_id: transactionGroup.id,
      catalog_id: item.catalog_id,
      quantity: item.quantity,
      note: item.note,
      subtotal: item.subtotal
    }));

    await TransactionItem.bulkCreate(transactionItems, { transaction: t });

    await t.commit();

    res.status(201).json({
      message: 'Admin order created successfully',
      order: {
        id: transactionGroup.id,
        total,
        cashback
      }
    });

  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

module.exports = router;