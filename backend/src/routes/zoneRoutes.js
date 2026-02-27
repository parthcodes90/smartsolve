const express = require('express');
const router = express.Router();
const { listZones } = require('../controllers/zoneController');

router.get('/', listZones);

module.exports = router;
