require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const complaintRoutes = require('./routes/complaints');
const zoneRoutes = require('./routes/zones');
const departmentRoutes = require('./routes/departments');
const authRoutes = require('./routes/auth');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'municipal-complaint-backend' });
});

app.use('/api/complaints', complaintRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/auth', authRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

module.exports = app;