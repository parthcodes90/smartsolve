const express = require('express');
const multer = require('multer');
const db = require('../config/db');
const { uploadPhoto } = require('../services/fileUpload');
const { resolveZone } = require('../services/zoneResolver');
const { processComplaint } = require('../services/aiProcessor');
const { assignDepartment } = require('../services/assignmentService');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

function validatePayload(req, res, next) {
  const { description, category_id: categoryId, latitude, longitude } = req.body;

  if (!description || typeof description !== 'string' || description.trim().length < 5) {
    return res.status(400).json({ message: 'description is required (min length 5).' });
  }

  if (!categoryId || !/^[0-9a-fA-F-]{36}$/.test(categoryId)) {
    return res.status(400).json({ message: 'category_id must be a UUID.' });
  }

  const lat = Number(latitude);
  const lng = Number(longitude);
  if (Number.isNaN(lat) || lat < -90 || lat > 90) {
    return res.status(400).json({ message: 'latitude must be between -90 and 90.' });
  }

  if (Number.isNaN(lng) || lng < -180 || lng > 180) {
    return res.status(400).json({ message: 'longitude must be between -180 and 180.' });
  }

  return next();
}

router.post('/', upload.single('photo'), validatePayload, async (req, res, next) => {
  try {
    const { description, category_id: categoryId, latitude, longitude, address, submitted_by: submittedBy } = req.body;

    const lat = Number(latitude);
    const lng = Number(longitude);

    const photoUrl = await uploadPhoto(req.file?.buffer);
    const zone = await resolveZone(lat, lng);
    if (!zone) {
      return res.status(422).json({ message: 'Unable to resolve municipality zone for the provided location.' });
    }

    const categoryResult = await db.query('SELECT id, name FROM complaint_categories WHERE id = $1 LIMIT 1;', [categoryId]);
    if (!categoryResult.rows[0]) {
      return res.status(400).json({ message: 'Unknown category_id.' });
    }

    const ai = await processComplaint({
      description,
      category: categoryResult.rows[0].name,
      zone,
      address
    });

    const department = await assignDepartment({ zoneId: zone.id, deptCode: ai.dept_code });

    const complaintInsert = await db.query(
      `INSERT INTO complaints (
        description, category_id, photo_url, latitude, longitude, address, submitted_by,
        zone_id, assigned_department_id, severity_score, location_sensitivity_score,
        public_risk_score, priority_score, priority_label, ai_reasoning, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11,
        $12, $13, $14, $15, 'ASSIGNED'
      ) RETURNING id;`,
      [
        description,
        categoryId,
        photoUrl,
        lat,
        lng,
        address || null,
        submittedBy || 'anonymous',
        zone.id,
        department.id,
        ai.severity,
        ai.location_sensitivity,
        ai.public_risk,
        ai.priorityScore,
        ai.priorityLabel,
        ai.ai_reasoning
      ]
    );

    await db.query(
      `INSERT INTO assignment_logs (complaint_id, department_id, action, notes)
       VALUES ($1, $2, 'ASSIGNED', $3);`,
      [complaintInsert.rows[0].id, department.id, `Auto-assigned using dept code ${ai.dept_code}`]
    );

    return res.status(201).json({
      complaint_id: complaintInsert.rows[0].id,
      zone,
      assigned_department: department,
      priority_score: ai.priorityScore,
      priority_label: ai.priorityLabel,
      scores: {
        severity: ai.severity,
        location_sensitivity: ai.location_sensitivity,
        public_risk: ai.public_risk
      },
      ai_reasoning: ai.ai_reasoning,
      status: 'ASSIGNED'
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
