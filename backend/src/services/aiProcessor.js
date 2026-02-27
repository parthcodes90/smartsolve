const { CATEGORY_TO_DEPARTMENT, DEPARTMENT_CODES } = require('../config/constants');

function clampScore(value) {
  const number = Number(value);
  if (Number.isNaN(number)) return 5;
  return Math.max(1, Math.min(10, Math.round(number)));
}

function priorityLabel(score) {
  if (score >= 8) return 'CRITICAL';
  if (score >= 6) return 'HIGH';
  if (score >= 4) return 'MEDIUM';
  return 'LOW';
}

function heuristicClassification(description = '', category = '') {
  const text = `${description} ${category}`.toLowerCase();
  const mapped = Object.entries(CATEGORY_TO_DEPARTMENT).find(([key]) => text.includes(key));
  return mapped?.[1] || 'ROADS';
}

function computePriorityScores(severity, locationSensitivity, publicRisk) {
  const priorityScore = Number((severity * 0.4 + locationSensitivity * 0.3 + publicRisk * 0.3).toFixed(1));
  return { priorityScore, priorityLabel: priorityLabel(priorityScore) };
}

async function processComplaint({ description, category, zone, address }) {
  const fallbackDept = heuristicClassification(description, category);

  if (!process.env.ANTHROPIC_API_KEY) {
    const severity = clampScore((description || '').length > 120 ? 8 : 6);
    const locationSensitivity = clampScore((address || '').match(/school|hospital|market|main/i) ? 8 : 5);
    const publicRisk = clampScore((description || '').match(/accident|injury|danger|unsafe|flood/i) ? 8 : 6);
    const scores = computePriorityScores(severity, locationSensitivity, publicRisk);

    return {
      dept_code: fallbackDept,
      severity,
      location_sensitivity: locationSensitivity,
      public_risk: publicRisk,
      ...scores,
      ai_reasoning: `Heuristic fallback used for ${zone?.name || 'unresolved zone'}.`
    };
  }

  let Anthropic;
  try {
    ({ Anthropic } = require('@anthropic-ai/sdk'));
  } catch {
    const severity = 6;
    const locationSensitivity = 6;
    const publicRisk = 6;
    return {
      dept_code: fallbackDept,
      severity,
      location_sensitivity: locationSensitivity,
      public_risk: publicRisk,
      ...computePriorityScores(severity, locationSensitivity, publicRisk),
      ai_reasoning: 'Anthropic SDK missing; used deterministic fallback.'
    };
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const prompt = `Classify complaint department and score priority for a municipality.
Output strict JSON with keys: dept_code, severity, location_sensitivity, public_risk, ai_reasoning.
Allowed dept_code: ${DEPARTMENT_CODES.join(', ')}.
Complaint: ${description}
Category: ${category}
Address: ${address || 'N/A'}
Zone: ${zone?.name || 'N/A'} (${zone?.ward_number || 'N/A'})`;

  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-latest',
    max_tokens: 400,
    messages: [{ role: 'user', content: prompt }]
  });

  const content = response.content?.[0]?.text || '{}';
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    parsed = {};
  }

  const severity = clampScore(parsed.severity);
  const locationSensitivity = clampScore(parsed.location_sensitivity);
  const publicRisk = clampScore(parsed.public_risk);

  return {
    dept_code: DEPARTMENT_CODES.includes(parsed.dept_code) ? parsed.dept_code : fallbackDept,
    severity,
    location_sensitivity: locationSensitivity,
    public_risk: publicRisk,
    ...computePriorityScores(severity, locationSensitivity, publicRisk),
    ai_reasoning: parsed.ai_reasoning || 'AI response normalized to schema.'
  };
}

module.exports = { processComplaint };
