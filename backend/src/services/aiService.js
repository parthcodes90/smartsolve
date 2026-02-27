const axios = require('axios');

const DEPT_CODES = [
  'ROADS',
  'SANITATION',
  'WATER_SUPPLY',
  'ELECTRICITY',
  'PARKS',
  'DRAINAGE',
  'HEALTH',
  'BUILDING',
];

const PRIORITY_LABELS = new Set(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']);

function buildPrompt({ description, category, zone }) {
  return `You are a municipal complaint classification system for ${zone?.name || 'Unknown Zone'} (Ward: ${zone?.ward_number || 'N/A'}).

Analyze this public complaint and classify it. Respond ONLY with valid JSON — no preamble, no markdown.

Complaint Details:
- Description: ${description}
- Category: ${category}

Available department codes: ${DEPT_CODES.join(', ')}

Scoring guide (1 = lowest, 10 = highest):
- severity_score: How critical is the issue itself?
- location_sensitivity_score: Is it near a school, hospital, main road, or public area?
- public_risk_score: What is the risk to the public if this is left unresolved?

JSON format:
{
  "department_code": "ROADS",
  "reasoning": "one-line reason for department selection",
  "severity_score": 7,
  "location_sensitivity_score": 8,
  "public_risk_score": 6,
  "priority_label": "HIGH"
}

priority_label must be one of: CRITICAL, HIGH, MEDIUM, LOW`;
}

function safeIntScore(value, fallback = 3) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(10, Math.max(1, parsed));
}

function computePriority(ai) {
  return Number.parseFloat((
    ai.severity_score * 0.4 +
    ai.location_sensitivity_score * 0.3 +
    ai.public_risk_score * 0.3
  ).toFixed(2));
}

function normalizeResponse(ai, fallbackCode) {
  const normalized = {
    department_code: DEPT_CODES.includes(ai?.department_code) ? ai.department_code : (fallbackCode || null),
    reasoning: ai?.reasoning || 'Fallback routing based on category default department code.',
    severity_score: safeIntScore(ai?.severity_score),
    location_sensitivity_score: safeIntScore(ai?.location_sensitivity_score),
    public_risk_score: safeIntScore(ai?.public_risk_score),
    priority_label: PRIORITY_LABELS.has(ai?.priority_label) ? ai.priority_label : 'MEDIUM',
  };

  normalized.priority_score = computePriority(normalized);
  return normalized;
}

async function callAnthropic(prompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const response = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    },
    {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      timeout: 30000,
    }
  );

  const content = response?.data?.content?.[0]?.text;
  if (!content) {
    throw new Error('Empty AI response content');
  }

  return content.replace(/```json|```/g, '').trim();
}

async function processComplaint({ description, category, zone, fallbackDepartmentCode }) {
  const prompt = buildPrompt({ description, category, zone });

  try {
    const raw = await callAnthropic(prompt);
    const parsed = JSON.parse(raw);
    return normalizeResponse(parsed, fallbackDepartmentCode);
  } catch (error) {
    console.warn('[AI_FALLBACK_WARNING] AI classification failed, using category fallback.', error.message);

    const fallback = normalizeResponse(
      {
        department_code: fallbackDepartmentCode,
        reasoning: 'AI parse/call failure; fallback to category default department.',
        severity_score: 3,
        location_sensitivity_score: 3,
        public_risk_score: 3,
        priority_label: 'MEDIUM',
      },
      fallbackDepartmentCode
    );

    return fallback;
  }
}

module.exports = {
  processComplaint,
};
