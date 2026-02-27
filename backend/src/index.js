require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const complaintRoutes = require('./routes/complaintRoutes');
const zoneRoutes = require('./routes/zoneRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.STORAGE_TYPE === 'local') {
  app.use('/uploads', express.static('uploads'));
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/complaints', complaintRoutes);
app.use('/api/zones', zoneRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[SERVER] Civic Complaint Backend running on port ${PORT}`);
});
