const express = require('express');
const db = require('../config/db');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT id, name, ward_number FROM zones ORDER BY ward_number ASC NULLS LAST, name ASC;'
    );
    res.json({ zones: rows });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
