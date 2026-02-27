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

-- Seed complaints for dashboard/demo visibility.
-- Inserts are idempotent by checking unique description text.
INSERT INTO complaints (
  description,
  category_id,
  photo_url,
  latitude,
  longitude,
  address,
  submitted_by,
  zone_id,
  assigned_department_id,
  ai_department_code,
  ai_reasoning,
  severity_score,
  location_sensitivity_score,
  public_risk_score,
  priority_score,
  priority_label,
  status,
  assigned_at
)
SELECT
  seed.description,
  cat.id,
  NULL,
  seed.latitude,
  seed.longitude,
  seed.address,
  seed.submitted_by,
  z.id,
  d.id,
  seed.dept_code,
  seed.ai_reasoning,
  seed.severity_score,
  seed.location_sensitivity_score,
  seed.public_risk_score,
  seed.priority_score,
  seed.priority_label,
  seed.status,
  NOW()
FROM (
  VALUES
    (
      'Large pothole near municipal school causing traffic disruption.',
      'ROADS',
      'Zone A — North Ward',
      19.2200,
      72.8700,
      'MG Road, Near Municipal School',
      'citizen-a',
      'ROADS',
      'ASSIGNED',
      'Road damage affects commuter safety and traffic flow.',
      8,
      5,
      7,
      7.3,
      'HIGH'
    ),
    (
      'Overflowing garbage bins and foul smell in market lane.',
      'SANITATION',
      'Zone A — North Ward',
      19.2350,
      72.8850,
      'Central Market Lane',
      'citizen-b',
      'SANITATION',
      'PENDING',
      'Public hygiene risk in high-footfall commercial area.',
      6,
      7,
      8,
      7.0,
      'HIGH'
    ),
    (
      'No water supply reported since yesterday evening in Block C.',
      'WATER_SUPPLY',
      'Zone B — South Ward',
      19.0850,
      72.8450,
      'Block C Housing Colony',
      'citizen-c',
      'WATER_SUPPLY',
      'ASSIGNED',
      'Essential service outage affecting multiple households.',
      7,
      6,
      8,
      7.4,
      'HIGH'
    ),
    (
      'Street light not working at major junction for three nights.',
      'ELECTRICITY',
      'Zone B — South Ward',
      19.1000,
      72.8600,
      'South Junction Signal',
      'citizen-d',
      'ELECTRICITY',
      'RESOLVED',
      'Night visibility and safety concern at traffic intersection.',
      5,
      5,
      6,
      5.6,
      'MEDIUM'
    ),
    (
      'Drain blockage causing waterlogging after light rainfall.',
      'DRAINAGE',
      'Zone A — North Ward',
      19.2100,
      72.9000,
      'Lake View Road',
      'citizen-e',
      'DRAINAGE',
      'PENDING',
      'Likely repeat flooding risk if not cleared urgently.',
      7,
      6,
      7,
      6.9,
      'HIGH'
    )
) AS seed(
  description,
  category_code,
  zone_name,
  latitude,
  longitude,
  address,
  submitted_by,
  dept_code,
  status,
  ai_reasoning,
  severity_score,
  location_sensitivity_score,
  public_risk_score,
  priority_score,
  priority_label
)
JOIN complaint_categories cat ON cat.code = seed.category_code
JOIN zones z ON z.name = seed.zone_name
JOIN departments d ON d.zone_id = z.id AND d.code = seed.dept_code
WHERE NOT EXISTS (
  SELECT 1
  FROM complaints c
  WHERE c.description = seed.description
);
