const { z } = require('zod');

const complaintSchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  category_id: z.string().uuid().optional(),
  latitude: z.coerce.number().gte(-90).lte(90),
  longitude: z.coerce.number().gte(-180).lte(180),
  address: z.string().max(500).optional(),
  submitted_by: z.string().max(255).optional(),
});

module.exports = {
  complaintSchema,
};
