INSERT INTO zones (name, ward_number, boundary)
VALUES
  ('Zone A — North Ward', 'W-01', ST_GeomFromText('POLYGON((72.80 19.15, 72.95 19.15, 72.95 19.30, 72.80 19.30, 72.80 19.15))', 4326)),
  ('Zone B — South Ward', 'W-02', ST_GeomFromText('POLYGON((72.80 19.00, 72.95 19.00, 72.95 19.15, 72.80 19.15, 72.80 19.00))', 4326))
ON CONFLICT (name) DO NOTHING;

INSERT INTO complaint_categories (code, name)
VALUES
  ('ROADS', 'Roads'),
  ('SANITATION', 'Sanitation'),
  ('WATER_SUPPLY', 'Water Supply'),
  ('ELECTRICITY', 'Electricity'),
  ('PARKS', 'Parks'),
  ('DRAINAGE', 'Drainage'),
  ('HEALTH', 'Public Health'),
  ('BUILDING', 'Building')
ON CONFLICT (code) DO NOTHING;

INSERT INTO departments (zone_id, code, name)
SELECT z.id, d.code, d.name
FROM zones z
CROSS JOIN (
  VALUES
    ('ROADS', 'Roads & Infrastructure'),
    ('SANITATION', 'Sanitation & Waste Management'),
    ('WATER_SUPPLY', 'Water Supply & Sewerage'),
    ('ELECTRICITY', 'Electricity & Street Lighting'),
    ('PARKS', 'Parks & Horticulture'),
    ('DRAINAGE', 'Stormwater & Drainage'),
    ('HEALTH', 'Public Health'),
    ('BUILDING', 'Building & Permits')
) AS d(code, name)
ON CONFLICT (zone_id, code) DO NOTHING;
