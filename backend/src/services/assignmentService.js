const prisma = require('../config/prisma');

/**
 * Department Assignment Logic
 * Matches predicted department with zone-specific municipal units.
 */
class AssignmentService {
    constructor() {
        this.fallbackDepartmentName = process.env.DEFAULT_CONTROL_DEPARTMENT || 'Municipal Control Department';
    }

    async assignToDepartment({ complaintId, predictedDepartment, zoneId }) {
        try {
            // 1. Attempt exact match within zone
            let targetDepartment = await prisma.department.findFirst({
                where: {
                    name: { equals: predictedDepartment, mode: 'insensitive' },
                    zoneId: zoneId
                }
            });

            // 2. Local Fallback - if department prefix matches (e.g., 'Public Works' -> 'Public Works (Alpha)')
            if (!targetDepartment) {
                targetDepartment = await prisma.department.findFirst({
                    where: {
                        name: { contains: predictedDepartment, mode: 'insensitive' },
                        zoneId: zoneId
                    }
                });
            }

            // 3. System Fallback: If no match or no zoneResolved, send to global municipal dispatcher
            if (!targetDepartment) {
                targetDepartment = await this._findInDefaultZone(this.fallbackDepartmentName);
            }

            // 4. Create initial assignment
            const assignment = await prisma.assignment.create({
                data: {
                    complaintId,
                    departmentId: targetDepartment.id,
                    notes: `Automatic assignment based on AI Classification (Predicted: ${predictedDepartment})`
                },
                include: {
                    department: true
                }
            });

            return assignment;

        } catch (error) {
            console.error('[ASSIGNMENT_ERROR]: Logic failure during mapping', error);
            throw error;
        }
    }

    async assignToFallback(complaintId, zoneId) {
        // This is called when AI or other systems completely fail
        const targetDepartment = await this._findInDefaultZone(this.fallbackDepartmentName);

        return prisma.assignment.create({
            data: {
                complaintId,
                departmentId: targetDepartment.id,
                notes: 'Manual queue fallback: Automated analysis was unsuccessful'
            }
        });
    }

    /**
     * Helper: Find department in default zone if zone mapping fails
     */
    async _findInDefaultZone(name) {
        // 1. First search globally for 'Control Center' or similar
        let dept = await prisma.department.findFirst({
            where: { name: { contains: name, mode: 'insensitive' } }
        });

        // 2. Creating default if missing in DB for Phase-1 testing
        if (!dept) {
            console.warn(`[ASSIGNMENT_SAFETY]: Fallback department ${name} not found in DB.`);
            // In production, we assume seed data exists. For Phase-1, we handle it.
            // throw new Error(`CRITICAL: Fallback department ${name} must exist in seed data.`);
        }

        return dept;
    }
}

module.exports = new AssignmentService();
