const { z } = require('zod');

/**
 * Zod Schema for Complaint Intake
 * Validates fields from multipart/form-data
 */
const complaintSchema = z.object({
    description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
    address: z.string().max(500).optional(),
    category: z.string().min(1),
    latitude: z.string().transform((val) => parseFloat(val)), // Multi-part sends strings
    longitude: z.string().transform((val) => parseFloat(val)),
    citizen_name: z.string().max(100).optional(),
    citizen_email: z.string().email().optional(),
    citizen_phone: z.string().max(20).optional()
});

module.exports = {
    complaintSchema
};
