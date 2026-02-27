const { createClient } = require('@neondatabase/neon-js');

const neon = createClient({
  projectId: process.env.NEON_PROJECT_ID,
  auth: {
    secret: process.env.NEON_AUTH_SECRET,
    baseURL: process.env.NEON_AUTH_URL,
  },
});

module.exports = neon;
