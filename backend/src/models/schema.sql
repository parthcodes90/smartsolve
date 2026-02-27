CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS zones (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(100) NOT NULL,
  ward_number  VARCHAR(20),
  boundary     JSONB,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS departments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id         UUID NOT NULL REFERENCES zones(id),
  name            VARCHAR(100) NOT NULL,
  code            VARCHAR(50) NOT NULL,
  contact_email   VARCHAR(255),
  contact_phone   VARCHAR(20),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (zone_id, code)
);

CREATE TABLE IF NOT EXISTS categories (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                    VARCHAR(100) NOT NULL,
  default_department_code VARCHAR(50),
  base_severity           INT DEFAULT 3
);

CREATE TABLE IF NOT EXISTS complaints (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description   TEXT NOT NULL,
  category_id   UUID REFERENCES categories(id),
  photo_url     TEXT,
  latitude      DECIMAL(10, 8),
  longitude     DECIMAL(11, 8),
  address       TEXT,
  submitted_by  VARCHAR(255),
  zone_id       UUID REFERENCES zones(id),
  assigned_department_id  UUID REFERENCES departments(id),
  ai_department_code      VARCHAR(50),
  ai_reasoning            TEXT,
  severity_score              INT,
  location_sensitivity_score  INT,
  public_risk_score           INT,
  priority_score              DECIMAL(4, 2),
  priority_label              VARCHAR(20),
  status        VARCHAR(50) DEFAULT 'PENDING',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  assigned_at   TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS assignment_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id    UUID REFERENCES complaints(id),
  department_id   UUID REFERENCES departments(id),
  assigned_by     VARCHAR(50) DEFAULT 'AI',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_complaints_zone       ON complaints(zone_id);
CREATE INDEX IF NOT EXISTS idx_complaints_dept       ON complaints(assigned_department_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status     ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_priority   ON complaints(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_created    ON complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_departments_zone_code ON departments(zone_id, code);
