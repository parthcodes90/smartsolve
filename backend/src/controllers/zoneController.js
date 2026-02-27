const pool = require('../config/db');

const listZones = async (_req, res) => {
  const result = await pool.query(
    `SELECT id, name, ward_number, created_at
     FROM zones
     ORDER BY created_at DESC`
  );

  res.json({ zones: result.rows });
};

module.exports = {
  listZones,
};
