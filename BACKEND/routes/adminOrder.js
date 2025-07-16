const express = require('express');
const router = express.Router();
const { TransactionGroup, TransactionItem, Catalog } = require('../models');
const { auth } = require('../middlewares/auth');

router.get('/orders', auth('admin'), async (req, res) => {
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

router.get('/orders/:id', auth('admin'), async (req, res) => {
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
//   try {
//     const { id } = req.params;

//     const order = await TransactionGroup.findByPk(id, {
//       include: [
//         {
//           model: TransactionItem,
//           include: [
//             {
//               model: Catalog,
//               attributes: ['name', 'category', 'price']
//             }
//           ]
//         }
//       ]
//     });

//     if (!order) {
//       return res.status(404).json({ message: 'Order not found' });
//     }

//     const items = order.TransactionItems.map(item => ({
//       name: item.Catalog.name,
//       quantity: item.quantity,
//       price: item.Catalog.price,
//       subtotal: item.subtotal,
//       note: item.note
//     }));

//     res.json({
//       message: 'Transaction detail retrieved successfully',
//       success: true,
//       data: {
//         orderNumber: order.order_number,
//         orderDate: order.createdAt.toLocaleString('id-ID', {
//           weekday: 'long',
//           day: '2-digit',
//           month: '2-digit',
//           year: 'numeric',
//           hour: '2-digit',
//           minute: '2-digit'
//         }),
//         customerName: order.customer_name,
//         transactionType: order.transaction_type,
//         table: order.table,
//         items,
//         subTotal: order.subtotal_group,
//         tax: order.tax,
//         total: order.total,
//         cash: order.cash,
//         cashback: order.cashback
//       }
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error', error });
//   }
// });

router.get('/orders/detail-transaction/:id', auth('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const order = await TransactionGroup.findByPk(id, {
      include: [
        {
          model: TransactionItem,
          include: [
            {
              model: Catalog,
              attributes: ['name', 'price']
            }
          ]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Format data untuk response
    const formattedOrder = {
      orderNumber: order.order_number,
      orderDate: formatOrderDate(order.createdAt),
      customerName: order.customer_name,
      transactionType: order.transaction_type,
      table: order.table,
      items: order.TransactionItems.map(item => ({
        name: item.Catalog.name,
        quantity: item.quantity,
        price: item.Catalog.price.toString(),
        subtotal: item.subtotal,
        note: item.note
      })),
      subTotal: order.subtotal_group,
      tax: order.tax,
      total: order.total,
      cash: order.cash,
      cashback: order.cashback
    };

    res.json({
      message: 'Transaction detail retrieved successfully',
      success: true,
      data: formattedOrder
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// Fungsi format tanggal ke format "Senin, 08/07/2025, 10.35"
function formatOrderDate(date) {
  const options = { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };
  return new Intl.DateTimeFormat('id-ID', options).format(date);
}

module.exports = router;