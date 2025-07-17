const express = require('express');
const router = express.Router();
const { TransactionGroup, TransactionItem, Catalog } = require('../models');
const { Op, fn, col } = require('sequelize');
const { auth, } = require('../middlewares/auth');

// Dashboard Utama
// router.get('/', auth('admin'), async (req, res) => {
//   try {
//     console.log('📊 GET /admin/dashboard');

//     // Hitung total order unik berdasarkan order_number
//     const orders = await TransactionGroup.findAll({
//       attributes: ['order_number', 'total'],
//       raw: true
//     });

//     const uniqueOrderMap = {};
//     orders.forEach(order => {
//       uniqueOrderMap[order.order_number] = order.total;
//     });

//     const totalOrders = Object.keys(uniqueOrderMap).length;
//     const totalOmzet = Object.values(uniqueOrderMap).reduce((sum, val) => sum + val, 0);

//     // Ambil semua item, lalu buang item duplikat berdasarkan transaction_group_id + catalog_id
//     const allItems = await TransactionItem.findAll({
//       include: {
//         model: Catalog,
//         attributes: ['category']
//       },
//       raw: true
//     });

//     const uniqueItemMap = {};
//     allItems.forEach(item => {
//       const key = `${item.transaction_group_id}_${item.catalog_id}`;
//       uniqueItemMap[key] = item;
//     });

//     const dataCategory = {
//       foods: 0,
//       beverages: 0,
//       deserts: 0
//     };

//     let allMenuOrders = 0;

//     Object.values(uniqueItemMap).forEach(item => {
//       const category = item['Catalog.category'];

//       if (category === 'foods') {
//         dataCategory.foods += item.quantity;
//       } else if (category === 'beverages') {
//         dataCategory.beverages += item.quantity;
//       } else if (category === 'dessert' || category === 'deserts') {
//         dataCategory.deserts += item.quantity;
//       }

//       allMenuOrders += item.quantity;
//     });

//     return res.json({
//       message: 'Admin dashboard accessed successfully',
//       success: true,
//       data: {
//         totalOrders,
//         totalOmzet,
//         allMenuOrders,
//         ...dataCategory
//       }
//     });
//   } catch (error) {
//     console.error('🔥 Error /dashboard:', error);
//     return res.status(500).json({ message: 'Internal server error', error });
//   }
// });

router.get('/', auth('admin'), async (req, res) => {
  try {
    console.log('📊 GET /admin/dashboard');

    // Hitung total order unik berdasarkan order_number
    const orders = await TransactionGroup.findAll({
      attributes: ['order_number', 'total'],
      raw: true
    });

    const uniqueOrderMap = {};
    orders.forEach(order => {
      uniqueOrderMap[order.order_number] = order.total;
    });

    const totalOrders = Object.keys(uniqueOrderMap).length;
    const totalOmzetRaw = Object.values(uniqueOrderMap).reduce((sum, val) => sum + val, 0);

    // ✅ Hitung omzet tanpa pajak (anggap total sudah termasuk 10% PPN)
    const totalOmzet = Math.round(totalOmzetRaw / 1.1); // dibulatkan ke atas/bawah

    // Ambil semua item, lalu buang item duplikat berdasarkan transaction_group_id + catalog_id
    const allItems = await TransactionItem.findAll({
      include: {
        model: Catalog,
        attributes: ['category']
      },
      raw: true
    });

    const uniqueItemMap = {};
    allItems.forEach(item => {
      const key = `${item.transaction_group_id}_${item.catalog_id}`;
      uniqueItemMap[key] = item;
    });

    const dataCategory = {
      foods: 0,
      beverages: 0,
      deserts: 0
    };

    let allMenuOrders = 0;

    Object.values(uniqueItemMap).forEach(item => {
      const category = item['Catalog.category'];

      if (category === 'foods') {
        dataCategory.foods += item.quantity;
      } else if (category === 'beverages') {
        dataCategory.beverages += item.quantity;
      } else if (category === 'dessert' || category === 'deserts') {
        dataCategory.deserts += item.quantity;
      }

      allMenuOrders += item.quantity;
    });

    return res.json({
      message: 'Admin dashboard accessed successfully',
      success: true,
      data: {
        totalOrders,
        totalOmzet,
        allMenuOrders,
        ...dataCategory
      }
    });
  } catch (error) {
    console.error('🔥 Error /dashboard:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
});


// Chart per hari: jumlah item berdasarkan kategori
// Chart per hari: jumlah item berdasarkan kategori
router.get('/omzet', auth('admin'), async (req, res) => {
  try {
    console.log('📊 GET /admin/dashboard/omzet');

    const items = await TransactionItem.findAll({
      include: [
        {
          model: TransactionGroup,
          as: 'TransactionGroup', // alias harus sesuai
          attributes: ['createdAt'],
          required: true
        },
        {
          model: Catalog,
          attributes: ['category'],
          required: true
        }
      ],
      raw: true
    });

    const chartMap = {};

    for (const item of items) {
      const date = new Date(item['TransactionGroup.createdAt']).toLocaleDateString('id-ID');
      const category = item['Catalog.category'];
      const qty = item.quantity;

      if (!chartMap[date]) {
        chartMap[date] = {
          date,
          foods: 0,
          beverages: 0,
          deserts: 0
        };
      }

      if (category === 'foods') {
        chartMap[date].foods += qty;
      } else if (category === 'beverages') {
        chartMap[date].beverages += qty;
      } else if (category === 'dessert' || category === 'deserts') {
        chartMap[date].deserts += qty;
      }
    }

    const result = Object.values(chartMap);

    // Hitung total keseluruhan item dari semua kategori
    const totalItemsSold = result.reduce((sum, row) =>
      sum + row.foods + row.beverages + row.deserts, 0);

    return res.json({
      message: 'Admin omzet accessed successfully',
      success: true,
      data: result,
      totalItemsSold // <- tambahan ini
    });

  } catch (error) {
    console.error('🔥 Error /omzet:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
});
// Chart per hari: total omzet per tanggal
// Chart omzet per hari berdasarkan TransactionGroup (bukan dari item)

router.get('/chart', auth('admin'), async (req, res) => {
  try {
    console.log('📊 GET /admin/dashboard/chart');

    const items = await TransactionItem.findAll({
      include: [
        {
          model: TransactionGroup,
          as: 'TransactionGroup',
          attributes: ['createdAt', 'order_number']
        },
        {
          model: Catalog,
          attributes: ['category']
        }
      ],
      raw: true
    });

    const uniqueItemMap = {};
    items.forEach(item => {
      const key = `${item.transaction_group_id}_${item.catalog_id}`;
      uniqueItemMap[key] = item;
    });

    const chartMap = {};

    Object.values(uniqueItemMap).forEach(item => {
      const rawDate = item['TransactionGroup.createdAt'];
      const dateObj = new Date(rawDate.getTime() + 7 * 60 * 60 * 1000); // WIB
      const date = dateObj.toISOString().split('T')[0]; // hasilnya: 2025-07-15

      const category = item['Catalog.category']?.toLowerCase();
      const subtotal = Number(item.subtotal || 0);

      if (!date || !category) return;

      if (!chartMap[date]) {
        chartMap[date] = {
          date,
          foods: 0,
          beverages: 0,
          desserts: 0,
          total: 0
        };
      }

      if (category === 'foods') chartMap[date].foods += subtotal;
      else if (category === 'beverages') chartMap[date].beverages += subtotal;
      else if (category === 'dessert' || category === 'desserts') chartMap[date].desserts += subtotal;

      chartMap[date].total += subtotal;
    });

    const result = Object.values(chartMap);

    return res.json({
      message: 'Omzet per tanggal fetched successfully',
      success: true,
      data: result
    });

  } catch (error) {
    console.error('🔥 Error /chart:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// Summary hari ini
router.get('/summary', auth('admin'), async (req, res) => {
  try {
    console.log('📊 GET /admin/dashboard/summary');

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

    return res.json({ totalOrder, totalOmset });
  } catch (error) {
    console.error('🔥 Error /summary:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
});

// Top kategori berdasarkan quantity
router.get('/top-category', auth('admin'), async (req, res) => {
  try {
    console.log('📊 GET /admin/dashboard/top-category');

    const items = await TransactionItem.findAll({
      include: {
        model: Catalog,
        attributes: ['category'],
        required: true
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

    return res.json(sorted);
  } catch (error) {
    console.error('🔥 Error /top-category:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
});

router.get('/category/:category', auth('admin'), async (req, res) => {
  try {
    const { category } = req.params;

    const items = await TransactionItem.findAll({
      include: [
        {
          model: Catalog,
          where: { category },
          attributes: ['name', 'category']
        }
      ],
      attributes: ['catalog_id'],
      raw: true
    });

    // Hitung total menu yang terjual per nama menu
    const result = {};
    for (const item of items) {
      const name = item['Catalog.name'];
      if (!result[name]) {
        result[name] = 1;
      } else {
        result[name]++;
      }
    }

    // Ubah ke array dan urutkan berdasarkan total terjual
    const formatted = Object.entries(result).map(([name, total_sold]) => ({
      name,
      total_sold
    }));

    res.json({ message: 'Kategori detail fetched', data: formatted });
  } catch (error) {
    console.error('Error fetch kategori:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});


module.exports = router;
