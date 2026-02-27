const express = require('express');
const db = require('../config/db');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT
        d.id,
        d.name,
        COALESCE(d.code, 'N/A') AS code,
        z.name AS zone,
        COUNT(c.id) FILTER (WHERE c.status NOT IN ('RESOLVED', 'CLOSED'))::int AS "activeComplaints",
        COUNT(c.id)::int AS "totalComplaints"
      FROM departments d
      LEFT JOIN zones z ON z.id = d.zone_id
      LEFT JOIN complaints c ON c.assigned_department_id = d.id
      GROUP BY d.id, d.name, d.code, z.name
      ORDER BY d.name ASC;`
    );

    const departments = rows.map((department) => ({
      ...department,
      head: 'Unassigned',
      staff: 0,
      avgResolutionTime: 'N/A'
    }));

    res.json({ data: departments });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
