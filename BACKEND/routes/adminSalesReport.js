const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { TransactionGroup, TransactionItem, Catalog, User } = require('../models');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { auth } = require('../middlewares/auth');

// GET /admin/sales-report
// ✅ GET /admin/sales-report (support filter, export, dan pagination yang benar)
router.get('/sales-report', auth('admin'), async (req, res) => {
  try {
    const { start, finish, category, orderType, search, export: exportType } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const whereClause = {};

    // Filter tanggal
    if (start && finish) {
      const startDate = new Date(start);
      startDate.setHours(0, 0, 0, 0);

      const finishDate = new Date(finish);
      finishDate.setHours(23, 59, 59, 999);

      whereClause.createdAt = { [Op.between]: [startDate, finishDate] };
    }

    if (orderType) {
      whereClause.transaction_type = orderType;
    }

    if (search) {
      whereClause[Op.or] = [
        { customer_name: { [Op.iLike]: `%${search}%` } },
        { order_number: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const includeItems = {
      model: TransactionItem,
      as: 'TransactionItems',
      include: [
        {
          model: Catalog,
          attributes: ['name', 'category', 'price'],
          ...(category && { where: { category } })
        }
      ]
    };

    const isExport = exportType === 'excel' || exportType === 'pdf';

    // ⚠️ Ambil semua data (tanpa limit) jika export, dan pakai offset-limit jika tidak
    const transactions = await TransactionGroup.findAll({
      where: whereClause,
      include: [includeItems],
      order: [['createdAt', 'DESC']]
    });

    // 💡 Hanya ambil yang memiliki TransactionItems (setelah filter kategori diterapkan)
    const filteredTransactions = transactions.filter(tx => tx.TransactionItems.length > 0);
    const count = filteredTransactions.length;
    const paginatedData = filteredTransactions.slice(offset, offset + limit);

    // ✅ Export Excel
    if (exportType === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sales Report');

      worksheet.columns = [
        { header: 'Order No', key: 'order_number', width: 15 },
        { header: 'Date', key: 'createdAt', width: 20 },
        { header: 'Customer', key: 'customer_name', width: 15 },
        { header: 'Type', key: 'transaction_type', width: 10 },
        { header: 'Table', key: 'table', width: 10 },
        { header: 'Item', key: 'item', width: 20 },
        { header: 'Qty', key: 'quantity', width: 5 },
        { header: 'Price', key: 'price', width: 10 },
        { header: 'Subtotal', key: 'subtotal', width: 10 },
        { header: 'Note', key: 'note', width: 20 },
        { header: 'SubTotal Group', key: 'subtotal_group', width: 15 },
        { header: 'Tax', key: 'tax', width: 10 },
        { header: 'Total', key: 'total', width: 10 },
        { header: 'Cash', key: 'cash', width: 10 },
        { header: 'Cashback', key: 'cashback', width: 10 },
      ];

      filteredTransactions.forEach(tx => {
        tx.TransactionItems.forEach(item => {
          worksheet.addRow({
            order_number: tx.order_number,
            createdAt: new Date(tx.createdAt).toLocaleString('id-ID'),
            customer_name: tx.customer_name,
            transaction_type: tx.transaction_type,
            table: tx.table,
            item: item.Catalog.name,
            quantity: item.quantity,
            price: item.Catalog.price,
            subtotal: item.subtotal,
            note: item.note,
            subtotal_group: tx.subtotal_group,
            tax: tx.tax,
            total: tx.total,
            cash: tx.cash,
            cashback: tx.cashback,
          });
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=sales-report.xlsx');
      await workbook.xlsx.write(res);
      return res.end();
    }

    // ✅ Export PDF
    if (exportType === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=sales-report.pdf');
      res.flushHeaders();

      const doc = new PDFDocument({ margin: 40 });
      doc.pipe(res);

      doc.fontSize(18).text('Sales Report', { align: 'center' });
      doc.moveDown();

      filteredTransactions.forEach((tx) => {
        doc
          .fontSize(12)
          .text(`Order No : ${tx.order_number}`)
          .text(`Customer : ${tx.customer_name}`)
          .text(`Date     : ${new Date(tx.createdAt).toLocaleString('id-ID')}`)
          .text(`Type     : ${tx.transaction_type}`)
          .text(`Table    : ${tx.table}`)
          .text(`Subtotal : Rp${tx.subtotal_group}`)
          .text(`Tax      : Rp${tx.tax}`)
          .text(`Total    : Rp${tx.total}`)
          .text(`Cash     : Rp${tx.cash}`)
          .text(`Cashback : Rp${tx.cashback}`)
          .moveDown(0.5)
          .text(`Items:`, { underline: true });

        tx.TransactionItems.forEach((item, i) => {
          doc.text(
            `  ${i + 1}. ${item.Catalog.name} (${item.Catalog.category})\n     Qty: ${item.quantity} | Price: Rp${item.Catalog.price} | Subtotal: Rp${item.subtotal}`,
            { lineGap: 2 }
          );
          if (item.note) {
            doc.text(`     Note: ${item.note}`, { lineGap: 2 });
          }
        });

        doc.moveDown().moveTo(40, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();
      });

      doc.end();
      return;
    }

    // ✅ Response default (JSON)
    res.json({
      message: "Sales report retrieved successfully",
      success: true,
      data: paginatedData,
      meta: {
        total: count,
        page,
        perPage: limit,
        totalPages: Math.ceil(count / limit),
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

router.get('/sales-report/:id/receipt', auth('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await TransactionGroup.findByPk(id, {
      include: [
        {
          model: TransactionItem,
          as: 'TransactionItems',
          include: [
            {
              model: Catalog,
              attributes: ['name', 'category', 'price']
            }
          ]
        },
        {
          model: User,
          as: 'user',
          attributes: ['username', 'email']
        }
      ]
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }

    res.json({
      message: 'Detail transaksi ditemukan',
      success: true,
      data: transaction
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server', error: err.message });
  }
});

module.exports = router;
