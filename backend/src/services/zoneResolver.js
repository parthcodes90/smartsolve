const db = require('../config/db');

async function resolveZone(latitude, longitude) {
  const query = `
    SELECT id, name, ward_number
    FROM zones
    WHERE ST_Contains(
      boundary,
      ST_SetSRID(ST_MakePoint($2, $1), 4326)
    )
    LIMIT 1;
  `;

  const { rows } = await db.query(query, [latitude, longitude]);
  if (rows[0]) return rows[0];

  const fallback = await db.query(
    'SELECT id, name, ward_number FROM zones ORDER BY created_at ASC LIMIT 1;'
  );
  return fallback.rows[0] || null;
}

module.exports = { resolveZone };
