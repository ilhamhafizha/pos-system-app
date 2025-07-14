const { TransactionGroup, TransactionItem, Catalog } = require('../models');
const { Op, fn, col } = require('sequelize');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');


module.exports = {
  getSalesReport: async (req, res) => {
    try {
      const cashierId = req.user.id;

      const {
        order_number,
        customer_name,
        transaction_type,
        start,
        finish
      } = req.query;

      const whereClause = {
        user_id: cashierId
      };

      if (order_number) {
        whereClause.order_number = {
          [Op.iLike]: `%${order_number}%`
        };
      }

      if (customer_name) {
        whereClause.customer_name = {
          [Op.iLike]: `%${customer_name}%`
        };
      }

      if (transaction_type) {
        whereClause.transaction_type = transaction_type;
      }

      if (start && finish) {
        const startDate = new Date(start);
        startDate.setHours(0, 0, 0, 0);

        const finishDate = new Date(finish);
        finishDate.setHours(23, 59, 59, 999);

        whereClause.createdAt = {
          [Op.between]: [startDate, finishDate]
        };
      }

      const transactions = await TransactionGroup.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        attributes: [
          'order_number',
          'createdAt',
          'transaction_type',
          'customer_name',
          'table',
          'total'
        ]
      });

      if (req.query.export === 'excel') {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Cashier Sales Report');

        worksheet.columns = [
          { header: 'Order No', key: 'order_number', width: 15 },
          { header: 'Date', key: 'createdAt', width: 20 },
          { header: 'Customer', key: 'customer_name', width: 20 },
          { header: 'Type', key: 'transaction_type', width: 10 },
          { header: 'Table', key: 'table', width: 10 },
          { header: 'Total', key: 'total', width: 15 }
        ];

        transactions.forEach(tx => {
          worksheet.addRow({
            order_number: tx.order_number,
            createdAt: new Date(tx.createdAt).toLocaleString('id-ID'),
            customer_name: tx.customer_name,
            transaction_type: tx.transaction_type,
            table: tx.table,
            total: tx.total
          });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=cashier-sales-report.xlsx');
        await workbook.xlsx.write(res);
        return res.end();
      }

      if (req.query.export === 'pdf') {
        const doc = new PDFDocument({ margin: 30, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=cashier-sales-report.pdf');
        doc.pipe(res);

        doc.fontSize(18).text('Cashier Sales Report', { align: 'center' });
        doc.moveDown();

        transactions.forEach(tx => {
          doc
            .fontSize(12)
            .text(`Order No: ${tx.order_number}`)
            .text(`Date: ${new Date(tx.createdAt).toLocaleString('id-ID')}`)
            .text(`Customer: ${tx.customer_name}`)
            .text(`Type: ${tx.transaction_type}`)
            .text(`Table: ${tx.table || '-'}`)
            .text(`Total: Rp${tx.total.toLocaleString('id-ID')}`)
            .moveDown();

          doc.moveTo(doc.x, doc.y).lineTo(550, doc.y).stroke();
          doc.moveDown();
        });

        doc.end();
        return;
      }

      res.json({
        success: true,
        message: 'Sales report retrieved successfully',
        data: transactions
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: 'Internal server error',
        error: err.message
      });
    }
  },

  getSalesDetailByOrderNumber: async (req, res) => {
    try {
      const { orderNumber } = req.params;
      const cashierId = req.user.id;

      const transaction = await TransactionGroup.findOne({
        where: { order_number: orderNumber, user_id: cashierId },
        attributes: ['order_number', 'createdAt', 'transaction_type', 'customer_name', 'table', 'subtotal_group', 'tax', 'total', 'cash', 'cashback'],
        include: [
          {
            model: TransactionItem,
            as: 'TransactionItems',
            attributes: ['quantity', 'note', 'subtotal'],
            include: {
              model: Catalog,
              attributes: ['name', 'price']
            }
          }
        ]
      });

      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      res.json({
        success: true,
        message: 'Transaction detail retrieved successfully',
        data: transaction
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error', error: err.message });
    }
  },

  getSalesSummary: async (req, res) => {
    try {
      const cashierId = req.user.id;

      const orders = await TransactionGroup.findAll({
        where: { user_id: cashierId },
        attributes: [
          [fn('COUNT', col('id')), 'total_order'],
          [fn('SUM', col('total')), 'total_omzet']
        ],
        raw: true
      });

      const items = await TransactionItem.findAll({
        include: {
          model: TransactionGroup,
          as: 'TransactionGroup',
          where: { user_id: cashierId },
          attributes: []
        },
        attributes: [
          [fn('SUM', col('quantity')), 'total_menu_sales']
        ],
        raw: true
      });

      const categoryCounts = await TransactionItem.findAll({
        include: [
          {
            model: TransactionGroup,
            as: 'TransactionGroup',
            where: { user_id: cashierId },
            attributes: []
          },
          {
            model: Catalog,
            attributes: ['category']
          }
        ],
        attributes: [
          [col('Catalog.category'), 'category'],
          [fn('SUM', col('quantity')), 'total']
        ],
        group: ['Catalog.category'],
        raw: true
      });

      const categoryMap = categoryCounts.reduce((acc, cur) => {
        acc[cur.category] = parseInt(cur.total);
        return acc;
      }, {});

      res.json({
        success: true,
        message: 'Sales summary retrieved successfully',
        data: {
          total_order: parseInt(orders[0].total_order) || 0,
          total_omzet: parseInt(orders[0].total_omzet) || 0,
          total_menu_sales: parseInt(items[0].total_menu_sales) || 0,
          foods: categoryMap['foods'] || 0,
          beverages: categoryMap['beverages'] || 0,
          desserts: categoryMap['dessert'] || 0
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: 'Internal server error',
        error: err.message
      });
    }
  },

  getTopMenusByCategory: async (req, res) => {
    try {
      const cashierId = req.user.id;
      const { category } = req.params;

      const items = await TransactionItem.findAll({
        include: [
          {
            model: TransactionGroup,
            as: 'TransactionGroup',
            where: { user_id: cashierId },
            attributes: []
          },
          {
            model: Catalog,
            where: { category }, // filter kategori
            attributes: ['name']
          }
        ],
        attributes: [
          [col('Catalog.name'), 'name'],
          [fn('SUM', col('quantity')), 'total_sold']
        ],
        group: ['Catalog.name'],
        order: [[fn('SUM', col('quantity')), 'DESC']],
        raw: true
      });

      res.json({
        success: true,
        message: `Top menus in ${category} retrieved successfully`,
        data: items
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: 'Internal server error',
        error: err.message
      });
    }
  },

  getListTotalOrder: async (req, res) => {
    try {
      const cashierId = req.user.id;

      const orders = await TransactionGroup.findAll({
        where: { user_id: cashierId },
        attributes: ['order_number', 'createdAt', 'customer_name', 'transaction_type', 'table', 'total'],
        order: [['createdAt', 'DESC']]
      });

      if (!orders.length) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      res.json({
        success: true,
        message: 'List of total orders retrieved',
        data: orders
      });
    } catch (err) {
      res.status(500).json({ message: 'Internal server error', error: err.message });
    }
  },

  getListTotalOmzet: async (req, res) => {
    try {
      const cashierId = req.user.id;

      const orders = await TransactionGroup.findAll({
        where: { user_id: cashierId },
        attributes: ['order_number', 'createdAt', 'customer_name', 'transaction_type', 'table', 'total'],
        order: [['createdAt', 'DESC']]
      });

      if (!orders.length) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      res.json({
        success: true,
        message: 'List of total omzet retrieved',
        data: orders
      });
    } catch (err) {
      res.status(500).json({ message: 'Internal server error', error: err.message });
    }
  },

  getListAllMenuSales: async (req, res) => {
    try {
      const cashierId = req.user.id;

      const items = await TransactionItem.findAll({
        include: [
          {
            model: Catalog,
            attributes: ['name', 'category']
          },
          {
            model: TransactionGroup,
            as: 'TransactionGroup',
            where: { user_id: cashierId },
            attributes: []
          }
        ],
        attributes: ['quantity', 'subtotal'],
        order: [['quantity', 'DESC']]
      });

      if (!items.length) {
        return res.status(404).json({ message: 'Transaction item not found' });
      }

      // Format data output
      const result = items.map(item => ({
        name: item.Catalog.name,
        category: item.Catalog.category,
        quantity: item.quantity,
        subtotal: item.subtotal
      }));

      res.json({
        success: true,
        message: 'List of all menu sales retrieved',
        data: result
      });
    } catch (err) {
      res.status(500).json({ message: 'Internal server error', error: err.message });
    }
  }



};
