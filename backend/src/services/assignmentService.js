const db = require('../config/db');

/**
 * Strict lookup — finds a department within a specific zone.
 * Returns null if not found (use for validation/checks).
 */
async function findDepartmentByCode(zoneId, code) {
  if (!zoneId || !code) return null;
  const result = await db.query(
    `SELECT id, name, code
     FROM departments
     WHERE zone_id = $1 AND code = $2
     LIMIT 1`,
    [zoneId, code]
  );
  return result.rows[0] || null;
}

/**
 * Resilient assignment lookup — tries zone-scoped match first,
 * falls back to any department with matching code, throws if none found.
 */
async function assignDepartment({ zoneId, deptCode }) {
  let result = await db.query(
    `SELECT id, name, code
     FROM departments
     WHERE zone_id = $1 AND code = $2
     LIMIT 1`,
    [zoneId, deptCode]
  );

  if (!result.rows[0]) {
    result = await db.query(
      `SELECT id, name, code
       FROM departments
       WHERE code = $1
       ORDER BY created_at ASC
       LIMIT 1`,
      [deptCode]
    );
  }

  if (!result.rows[0]) {
    throw new Error(`Department not found for code: ${deptCode}`);
  }

  return result.rows[0];
}

module.exports = { findDepartmentByCode, assignDepartment };