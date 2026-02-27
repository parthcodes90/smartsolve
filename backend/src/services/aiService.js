const axios = require('axios');
const { z } = require('zod');

/**
 * AI Service Integration Wrapper
 * Swappable later for OpenAI, Anthropic, or proprietary municipal LLM
 */
class AIService {
    constructor() {
        this.apiUrl = process.env.AI_SERVICE_URL;
        this.apiKey = process.env.AI_API_KEY;

        // Strict schema for AI results
        this.aiResponseSchema = z.object({
            departmentClassification: z.string(),
            severityScore: z.number().min(1).max(10),
            locationSensitivityScore: z.number().min(1).max(10),
            publicRiskScore: z.number().min(1).max(10),
            environmentalImpactScore: z.number().min(1).max(10),
            priorityScore: z.number(), // backend can recalculate this too
            priorityLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
            analyticsTags: z.array(z.string()),
            confidenceMetrics: z.object({
                overall: z.number().min(0).max(1)
            })
        });
    }

    async analyzeComplaint({ description, address, category, photoUrl, location }) {
        try {
            // PROMPT Construction (Context Injected)
            const prompt = `
        Analyze the following municipal complaint:
        Description: ${description}
        Address: ${address || 'Not provided'}
        Category: ${category}
        Location Context (lat/lng): ${JSON.stringify(location)}
        Image: ${photoUrl || 'Not provided'}
        
        Return internal analytics strictly in JSON format as follows:
        {
          "departmentClassification": "<Department Name>", 
          "severityScore": <1-10>, 
          "locationSensitivityScore": <1-10>, 
          "publicRiskScore": <1-10>, 
          "environmentalImpactScore": <1-10>,
          "priorityScore": <calculated value (1-100)>,
          "priorityLevel": "<LOW/MEDIUM/HIGH/CRITICAL>",
          "analyticsTags": ["tag1", "tag2"],
          "confidenceMetrics": { "overall": 0.XX }
        }
      `;

            // Simulating external LLM call (e.g., via OpenAI Vision API)
            let aiOutput;
            if (this.apiUrl && this.apiKey) {
                const response = await axios.post(this.apiUrl, { prompt }, {
                    headers: { 'Authorization': `Bearer ${this.apiKey}` }
                });
                aiOutput = response.data;
            } else {
                // Mocking AI response for Phase-1 testing
                aiOutput = this._mockAIResult(description, category);
            }

            // 1. Validation of AI Output
            const validated = this.aiResponseSchema.parse(aiOutput);

            // 2. Deterministic Priority Logic (Backend Override)
            // Safety check: if severity > 8, it must be at least HIGH
            if (validated.severityScore >= 8 && validated.priorityLevel === 'LOW') {
                validated.priorityLevel = 'MEDIUM';
            }

            return validated;

        } catch (error) {
            console.error('[AI_SERVICE_ERROR]: Interpretation failed', error.message);
            throw new Error('AI analysis failed to yield structured result');
        }
    }

    _mockAIResult(desc, category) {
        // Basic heuristics for Phase-1 mock
        const isUrgent = desc.toLowerCase().includes('broken') || desc.toLowerCase().includes('leaking');

        return {
            departmentClassification: category === 'Roads' ? 'Public Works' : 'General Maintenance',
            severityScore: isUrgent ? 8 : 4,
            locationSensitivityScore: 5,
            publicRiskScore: isUrgent ? 7 : 3,
            environmentalImpactScore: 5,
            priorityScore: isUrgent ? 75 : 30,
            priorityLevel: isUrgent ? 'HIGH' : 'LOW',
            analyticsTags: ['automated_classification', category.toLowerCase()],
            confidenceMetrics: { overall: 0.92 }
        };
    }
}

module.exports = new AIService();
