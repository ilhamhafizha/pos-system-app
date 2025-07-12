// File: controllers/dashboardCashier.js

const { TransactionItem, TransactionGroup, Catalog } = require('../models');
const { v4: uuidv4 } = require('uuid');

const dashboardCashier = {
  // ✅ Get menu list
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

  // ✅ Create new transaction group
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
  },

  // ✅ Add item to transaction
  addItemToTransaction: async (req, res) => {
    try {
      const { transactionGroupId } = req.params;
      const { catalog_id, quantity, note } = req.body;

      const catalog = await Catalog.findByPk(catalog_id);
      if (!catalog) return res.status(404).json({ message: 'Catalog item not found' });

      const subtotal = catalog.price * quantity;

      const newItem = await TransactionItem.create({
        transaction_group_id: transactionGroupId,
        catalog_id,
        quantity,
        note,
        subtotal
      });

      // ✅ Tambahkan nilai subtotal ke TransactionGroup
      const transaction = await TransactionGroup.findByPk(transactionGroupId);
      const updatedSubtotal = transaction.subtotal_group + subtotal;
      const updatedTotal = updatedSubtotal; // pajak tetap dihitung di payment

      await transaction.update({
        subtotal_group: updatedSubtotal,
        total: updatedTotal
      });

      res.json({
        success: true,
        message: 'Item added to transaction',
        data: newItem
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error });
    }
  },


  deleteItemFromTransaction: async (req, res) => {
    try {
      console.log("Masuk ke deleteItemFromTransaction");
      const { transactionItemId } = req.params;
      console.log("transactionItemId:", transactionItemId);

      const item = await TransactionItem.findByPk(transactionItemId);
      if (!item) {
        console.log("Item not found");
        return res.status(404).json({ message: 'Item not found' });
      }

      await item.destroy();
      return res.json({ success: true, message: 'Item deleted from transaction' });

    } catch (error) {
      console.error("ERROR:", error);
      res.status(500).json({ message: 'Internal server error', error });
    }
  },

  processPayment: async (req, res) => {
    try {
      const { transactionGroupId } = req.params;
      const { cash } = req.body;

      const transaction = await TransactionGroup.findByPk(transactionGroupId, {
        include: [
          {
            model: TransactionItem,
            as: 'TransactionItems' // <-- ini penting agar relasi dikenali
          }
        ]
      });

      if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

      // Hitung subtotal dari semua item
      const subtotal = transaction.TransactionItems.reduce(
        (acc, item) => acc + item.subtotal,
        0
      );

      const tax = subtotal * 0.1; // 10% pajak
      const total = subtotal + tax;

      if (cash < total) {
        return res.status(400).json({ message: 'Insufficient cash amount' });
      }

      const cashback = cash - total;

      // Update TransactionGroup
      await transaction.update({
        subtotal_group: subtotal,
        tax,
        total,
        cash,
        cashback
      });

      res.json({
        success: true,
        message: 'Payment processed successfully',
        data: {
          total,
          tax,
          cashback
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error', error });
    }


  },

  // Tambahkan ini di controllers/dashboardCashier.js
  getReceipt: async (req, res) => {
    try {
      const { transactionGroupId } = req.params;
  
      const transaction = await TransactionGroup.findByPk(transactionGroupId, {
        include: [{
          model: TransactionItem,
          as: 'TransactionItems',
          include: [{
            model: Catalog,
            attributes: ['name', 'price']
          }]
        }]
      });
  
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
  
      // Format item menjadi lebih rapi
      const items = transaction.TransactionItems.map(item => ({
        menu: item.Catalog.name,
        quantity: item.quantity,
        price: item.Catalog.price,
        subtotal: item.subtotal
      }));
  
      res.json({
        success: true,
        message: 'Receipt retrieved successfully',
        data: {
          order_number: transaction.order_number,
          customer_name: transaction.customer_name,
          table: transaction.table,
          transaction_type: transaction.transaction_type,
          items,
          subtotal: transaction.subtotal_group,
          tax: transaction.tax,
          total: transaction.total,
          cash: transaction.cash,
          cashback: transaction.cashback
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error', error });
    }
  }

};

// ✅ Export object yang lengkap
module.exports = dashboardCashier;
