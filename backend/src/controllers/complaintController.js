const pool = require('../config/db');
const storageService = require('../services/storageService');
const { resolveZone } = require('../services/zoneService');
const { processComplaint } = require('../services/aiService');
const { findDepartmentByCode } = require('../services/assignmentService');

const createComplaint = async (req, res) => {
  const { description, category_id, latitude, longitude, address, submitted_by } = req.body;

  const client = await pool.connect();

  try {
    let photo_url = null;
    if (req.file) {
      try {
        photo_url = await storageService.uploadPhoto(req.file.buffer, `complaint-${Date.now()}`);
      } catch (error) {
        console.warn('[PHOTO_UPLOAD_WARNING] Upload failed; continuing without photo.', error.message);
      }
    }

    const categoryResult = await client.query(
      'SELECT id, name, default_department_code FROM categories WHERE id = $1',
      [category_id]
    );

    const category = categoryResult.rows[0]?.name || 'Other';
    const defaultDepartmentCode = categoryResult.rows[0]?.default_department_code || null;

    const zone = await resolveZone(Number.parseFloat(latitude), Number.parseFloat(longitude));

    const ai = await processComplaint({
      description,
      category,
      zone,
      fallbackDepartmentCode: defaultDepartmentCode,
    });

    const department = zone?.id
      ? await findDepartmentByCode(zone.id, ai.department_code)
      : null;

    if (!department && ai.department_code) {
      console.warn(`[ASSIGNMENT_WARNING] Department code ${ai.department_code} not found in resolved zone.`);
    }

    await client.query('BEGIN');

    const insertComplaint = await client.query(
      `INSERT INTO complaints (
        description, category_id, photo_url, latitude, longitude, address,
        submitted_by, zone_id, assigned_department_id, ai_department_code,
        ai_reasoning, severity_score, location_sensitivity_score, public_risk_score,
        priority_score, priority_label, status, assigned_at
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,'ASSIGNED',NOW()
      )
      RETURNING id`,
      [
        description,
        category_id || null,
        photo_url,
        Number.parseFloat(latitude),
        Number.parseFloat(longitude),
        address || null,
        submitted_by || 'anonymous',
        zone?.id || null,
        department?.id || null,
        ai.department_code,
        ai.reasoning,
        ai.severity_score,
        ai.location_sensitivity_score,
        ai.public_risk_score,
        ai.priority_score,
        ai.priority_label,
      ]
    );

    const complaintId = insertComplaint.rows[0].id;

    await client.query(
      `INSERT INTO assignment_logs (complaint_id, department_id, assigned_by, notes)
       VALUES ($1, $2, 'AI', $3)`,
      [
        complaintId,
        department?.id || null,
        department
          ? `Assigned using department code ${ai.department_code}`
          : `No zone-level department found for code ${ai.department_code}; queued for manual review`,
      ]
    );

    await client.query('COMMIT');

    res.status(201).json({
      complaint_id: complaintId,
      zone: zone ? { id: zone.id, name: zone.name, ward_number: zone.ward_number } : null,
      assigned_department: {
        id: department?.id || null,
        name: department?.name || null,
        code: ai.department_code,
      },
      priority_score: ai.priority_score,
      priority_label: ai.priority_label,
      scores: {
        severity: ai.severity_score,
        location_sensitivity: ai.location_sensitivity_score,
        public_risk: ai.public_risk_score,
      },
      ai_reasoning: ai.reasoning,
      status: 'ASSIGNED',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[COMPLAINT_PROCESSING_ERROR]', error);
    res.status(500).json({ error: 'Complaint processing failed', detail: error.message });
  } finally {
    client.release();
  }
};

module.exports = {
  createComplaint,
};
