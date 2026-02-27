const pool = require('../config/db');

async function findDepartmentByCode(zoneId, code) {
  if (!zoneId || !code) return null;

  const result = await pool.query(
    'SELECT id, name, code FROM departments WHERE zone_id = $1 AND code = $2 LIMIT 1',
    [zoneId, code]
  );

  return result.rows[0] || null;
}

module.exports = {
  findDepartmentByCode,
};
