const express = require('express');
const router = express.Router();
const { Catalog } = require('../models');

// GET /admin/catalogs
router.get('/', async (req, res) => {
  try {
    const catalogs = await Catalog.findAll({
      where: {
        is_deleted: false
      },
      order: [['id', 'ASC']]
    });

    res.json(catalogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// GET /admin/catalogs/:id → ambil detail satu catalog berdasarkan ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const catalog = await Catalog.findByPk(id);

    if (!catalog) {
      return res.status(404).json({ message: 'Catalog not found' });
    }

    res.json(catalog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// POST /admin/catalogs → Tambah menu baru
router.post('/', async (req, res) => {
  try {
    const { image, name, category, price, description, is_deleted } = req.body;

    const newCatalog = await Catalog.create({
      image,
      name,
      category,
      price,
      description,
      is_deleted
    });

    res.status(201).json(newCatalog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// PUT /admin/catalogs/:id → Edit data catalog
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { image, name, category, price, description, is_deleted } = req.body;

    const catalog = await Catalog.findByPk(id);
    if (!catalog) {
      return res.status(404).json({ message: 'Catalog not found' });
    }

    await catalog.update({
      image,
      name,
      category,
      price,
      description,
      is_deleted
    });

    res.json(catalog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// DELETE /admin/catalogs/:id → Soft delete
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const catalog = await Catalog.findByPk(id);
    if (!catalog) {
      return res.status(404).json({ message: 'Catalog not found' });
    }

    await catalog.update({ is_deleted: true });

    res.json({ message: 'Catalog has been soft deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});



module.exports = router;