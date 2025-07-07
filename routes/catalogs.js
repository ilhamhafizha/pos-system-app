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

module.exports = router;