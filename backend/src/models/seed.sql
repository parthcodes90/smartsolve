INSERT INTO zones (id, name, ward_number) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Zone A — North Ward',  'W-01'),
  ('a2000000-0000-0000-0000-000000000002', 'Zone B — South Ward',  'W-02'),
  ('a3000000-0000-0000-0000-000000000003', 'Zone C — East Ward',   'W-03'),
  ('a4000000-0000-0000-0000-000000000004', 'Zone D — West Ward',   'W-04')
ON CONFLICT (id) DO NOTHING;

INSERT INTO departments (zone_id, name, code, contact_email) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Roads & Infrastructure',      'ROADS',        'roads.zoneA@municipality.gov'),
  ('a1000000-0000-0000-0000-000000000001', 'Sanitation & Waste',          'SANITATION',   'sanitation.zoneA@municipality.gov'),
  ('a1000000-0000-0000-0000-000000000001', 'Water Supply & Sewerage',     'WATER_SUPPLY', 'water.zoneA@municipality.gov'),
  ('a1000000-0000-0000-0000-000000000001', 'Electricity & Street Lights', 'ELECTRICITY',  'power.zoneA@municipality.gov'),
  ('a1000000-0000-0000-0000-000000000001', 'Parks & Horticulture',        'PARKS',        'parks.zoneA@municipality.gov'),
  ('a1000000-0000-0000-0000-000000000001', 'Stormwater & Drainage',       'DRAINAGE',     'drainage.zoneA@municipality.gov'),
  ('a1000000-0000-0000-0000-000000000001', 'Public Health',               'HEALTH',       'health.zoneA@municipality.gov'),
  ('a1000000-0000-0000-0000-000000000001', 'Building & Permits',          'BUILDING',     'building.zoneA@municipality.gov')
ON CONFLICT (zone_id, code) DO NOTHING;

INSERT INTO categories (name, default_department_code, base_severity) VALUES
  ('Pothole',              'ROADS',        7),
  ('Garbage Overflow',     'SANITATION',   6),
  ('Water Leakage',        'WATER_SUPPLY', 7),
  ('Street Light Out',     'ELECTRICITY',  4),
  ('Park Damage',          'PARKS',        3),
  ('Waterlogging',         'DRAINAGE',     8),
  ('Illegal Construction', 'BUILDING',     6),
  ('Stray Animals',        'HEALTH',       5),
  ('Other',                NULL,           3)
ON CONFLICT DO NOTHING;
