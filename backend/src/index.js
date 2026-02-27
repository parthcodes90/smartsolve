require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const complaintRoutes = require('./routes/complaintRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (for local storage option in Phase-1)
if (process.env.STORAGE_TYPE === 'local') {
  app.use('/uploads', express.static('uploads'));
}

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Municipal Civic Complaint API'
  });
});

// Routes
app.use('/api/complaints', complaintRoutes);

// Error Handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[SERVER] Civic Complaint Backend running on port ${PORT}`);
});
