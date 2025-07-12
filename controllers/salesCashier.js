const { TransactionGroup, TransactionItem, Catalog } = require('../models');

module.exports = {
  getSalesReport: async (req, res) => {
    try {
      const cashierId = req.user.id;

      const transactions = await TransactionGroup.findAll({
        where: { user_id: cashierId },
        order: [['createdAt', 'DESC']],
        attributes: [
          'order_number',
          'createdAt',
          'transaction_type',
          'customer_name'
        ],
        include: [
          {
            model: TransactionItem,
            as: 'TransactionItems',
            include: [
              {
                model: Catalog,
                attributes: ['name', 'category']
              }
            ]
          }
        ]
      });


      const result = transactions.map(tx => ({
        order_id: tx.id,
        order_number: tx.order_number,
        order_date: tx.createdAt,
        order_type: tx.transaction_type,
        customer_name: tx.customer_name,
        categories: [...new Set(tx.TransactionItems.map(item => item.Catalog.category))],
      }));

      res.json({
        success: true,
        message: 'Sales report with details retrieved successfully',
        data: result
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error', error: err.message });
    }
  }
};
