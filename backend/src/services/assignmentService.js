const db = require('../config/db');

async function assignDepartment({ zoneId, deptCode }) {
  let departmentResult = await db.query(
    `SELECT id, name, code
     FROM departments
     WHERE zone_id = $1 AND code = $2
     LIMIT 1;`,
    [zoneId, deptCode]
  );

  if (!departmentResult.rows[0]) {
    departmentResult = await db.query(
      `SELECT id, name, code
       FROM departments
       WHERE code = $1
       ORDER BY created_at ASC
       LIMIT 1;`,
      [deptCode]
    );
  }

  if (!departmentResult.rows[0]) {
    throw new Error(`Department not found for code ${deptCode}`);
  }

  return departmentResult.rows[0];
}

module.exports = { assignDepartment };
