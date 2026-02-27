const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
});

const getValidationErrors = (req) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return null;
  return errors.array().map((e) => ({ field: e.path, message: e.msg }));
};

const signToken = (user) => {
  const payload = {
    sub: user.id,
    email: user.email,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      points: user.points,
    },
  };

  return jwt.sign(payload, process.env.NEON_AUTH_SECRET, { expiresIn: '7d' });
};

router.post(
  '/register',
  authLimiter,
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Email must be valid').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  async (req, res) => {
    const validationErrors = getValidationErrors(req);
    if (validationErrors) {
      return res.status(422).json({ message: 'Validation failed', errors: validationErrors });
    }

    const { name, email, password } = req.body;

    try {
      const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ message: 'Email already registered' });
      }

      const id = uuidv4();
      const passwordHash = await bcrypt.hash(password, 10);
      const role = 'CITIZEN';
      const points = 0;

      const result = await db.query(
        `INSERT INTO users (id, name, email, password_hash, role, points, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         RETURNING id, name, email, role, points, created_at`,
        [id, name, email, passwordHash, role, points]
      );

      const user = result.rows[0];
      const token = signToken(user);

      return res.status(201).json({ token, user });
    } catch (err) {
      console.error('Register error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
);

router.post(
  '/login',
  authLimiter,
  body('email').isEmail().withMessage('Email must be valid').normalizeEmail(),
  body('password').isString().notEmpty().withMessage('Password is required'),
  async (req, res) => {
    const validationErrors = getValidationErrors(req);
    if (validationErrors) {
      return res.status(422).json({ message: 'Validation failed', errors: validationErrors });
    }

    const { email, password } = req.body;

    try {
      const result = await db.query(
        'SELECT id, name, email, password_hash, role, points, created_at FROM users WHERE email = $1',
        [email]
      );

      if (!result.rows.length) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const userRow = result.rows[0];
      const isValid = await bcrypt.compare(password, userRow.password_hash || '');
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const user = {
        id: userRow.id,
        name: userRow.name,
        email: userRow.email,
        role: userRow.role,
        points: userRow.points,
      };

      const token = signToken(user);
      return res.json({ token, user });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
);

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user.sub;
    const result = await db.query(
      'SELECT id, name, email, role, points, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error('Me error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/logout', authMiddleware, async (req, res) => {
  return res.json({ message: 'Logged out' });
});

module.exports = router;
