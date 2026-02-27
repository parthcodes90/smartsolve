const pool = require('../config/db');

async function resolveZone(latitude, longitude) {
  const geoQuery = `
    SELECT id, name, ward_number
    FROM zones
    WHERE boundary IS NOT NULL
      AND ST_Contains(
        ST_SetSRID(ST_GeomFromGeoJSON(boundary::text), 4326),
        ST_SetSRID(ST_MakePoint($1, $2), 4326)
      )
    LIMIT 1
  `;

  try {
    const result = await pool.query(geoQuery, [longitude, latitude]);

    if (result.rows.length > 0) {
      return result.rows[0];
    }
  } catch (error) {
    console.warn('[ZONE_RESOLVE_WARNING] PostGIS lookup failed, using default zone.', error.message);
  }

  const fallback = await pool.query('SELECT id, name, ward_number FROM zones ORDER BY created_at ASC LIMIT 1');
  return fallback.rows[0] || null;
}

module.exports = {
  resolveZone,
};
