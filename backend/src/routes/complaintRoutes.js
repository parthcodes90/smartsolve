const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const upload = require('../middleware/upload');
const validate = require('../middleware/validation');
const { complaintSchema } = require('../models/schemas/complaintSchema');

router.post('/', upload.single('photo'), validate(complaintSchema), complaintController.createComplaint);

module.exports = router;
