const { TransactionGroup } = require('../models');
const { v4: uuidv4 } = require('uuid');

const dashboardCashier = {
  // Sudah ada
  getMenuList: async (req, res) => {
    try {
      const menus = await Catalog.findAll({
        where: { is_deleted: false },
        attributes: ['id', 'name', 'price', 'category', 'description', 'image']
      });

      res.json({
        success: true,
        message: 'List menu retrieved successfully',
        data: menus
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get menu', error });
    }
  },

  // Baru ditambahkan: Membuat transaksi baru
  createTransactionGroup: async (req, res) => {
    try {
      const { customer_name, table, transaction_type } = req.body;

      if (!customer_name || !table || !transaction_type) {
        return res.status(400).json({ message: 'customer_name, table, and transaction_type are required' });
      }

      const order_number = 'ORD-' + uuidv4().split('-')[0].toUpperCase();

      const newTransaction = await TransactionGroup.create({
        user_id: req.user.id,
        customer_name,
        table,
        transaction_type,
        order_number,
        subtotal_group: 0,
        tax: 0,
        total: 0,
        cash: 0,
        cashback: 0
      });

      res.status(201).json({
        success: true,
        message: 'Transaction created successfully',
        data: newTransaction
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to create transaction', error });
    }
  }
};

module.exports = dashboardCashier;
