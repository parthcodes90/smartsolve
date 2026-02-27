const prisma = require('../config/prisma');
const storageService = require('../services/storageService');
const zoneService = require('../services/zoneService');
const aiService = require('../services/aiService');
const assignmentService = require('../services/assignmentService');

const createComplaint = async (req, res) => {
    const { description, address, category, latitude, longitude, citizen_name, citizen_email, citizen_phone } = req.body;
    const photoBuffer = req.file?.buffer; // From multer memory storage

    // 1. Photo Upload (Abstraction)
    let photoUrl = null;
    if (photoBuffer) {
        photoUrl = await storageService.uploadPhoto(photoBuffer, `complaint-${Date.now()}`);
    }

    // 2. Zone Resolution
    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);
    const resolvedZone = await zoneService.resolveZoneByCoords(latNum, lngNum);
    const zoneId = resolvedZone?.id || null;

    // 3. Initial Record Creation (Status: PENDING)
    const complaint = await prisma.complaint.create({
        data: {
            description,
            address,
            category,
            photoUrl,
            latitude: latNum,
            longitude: lngNum,
            citizenName: citizen_name || null,
            citizenEmail: citizen_email || null,
            citizenPhone: citizen_phone || null,
            zoneId,
            status: 'PENDING'
        }
    });

    // 4. Update Status (Status: AI_ANALYSIS)
    await prisma.complaint.update({
        where: { id: complaint.id },
        data: { status: 'AI_ANALYSIS' }
    });

    try {
        // 5. AI Analysis Integration
        const aiResponse = await aiService.analyzeComplaint({
            description,
            address,
            category,
            photoUrl,
            location: { lat: latNum, lng: lngNum }
        });

        // 6. Store AI Result
        const aiAnalysis = await prisma.aiAnalysis.create({
            data: {
                complaintId: complaint.id,
                departmentPrediction: aiResponse.departmentClassification,
                severityScore: aiResponse.severityScore,
                locationSensitivity: aiResponse.locationSensitivityScore,
                publicRiskScore: aiResponse.publicRiskScore,
                envImpactScore: aiResponse.environmentalImpactScore,
                priorityScore: aiResponse.priorityScore,
                priorityLevel: aiResponse.priorityLevel,
                analyticsTags: aiResponse.analyticsTags,
                confidence: aiResponse.confidenceMetrics.overall,
                rawAiOutput: aiResponse
            }
        });

        // 7. Department Assignment (Zone-aware)
        const assignment = await assignmentService.assignToDepartment({
            complaintId: complaint.id,
            predictedDepartment: aiResponse.departmentClassification,
            zoneId: zoneId
        });

        // 8. Final Status Update (Status: ASSIGNED)
        const finalComplaint = await prisma.complaint.update({
            where: { id: complaint.id },
            data: {
                status: 'ASSIGNED',
                priority: aiResponse.priorityLevel,
                assignedAt: new Date()
            },
            include: {
                aiAnalysis: true,
                assignments: {
                    include: {
                        department: true
                    }
                }
            }
        });

        res.status(201).json({
            success: true,
            message: 'Complaint received and assigned successfully',
            data: finalComplaint
        });

    } catch (error) {
        console.error(`[COMPLAINT_PROCESS_FAILED]: ${complaint.id}`, error);

        // Self-healing or Fallback to manual if AI fails
        // In Phase-1, we still assign to Manual Control Dept if AI or internal logic fails after intake
        const fallbackAssignment = await assignmentService.assignToFallback(complaint.id, zoneId);

        await prisma.complaint.update({
            where: { id: complaint.id },
            data: { status: 'ASSIGNED', assignedAt: new Date() }
        });

        res.status(202).json({
            success: true,
            message: 'Complaint intake completed with manual queue fallback',
            complaintId: complaint.id,
            error_hint: 'AI analysis or automatic assignment failed, assigned to control center.'
        });
    }
};

module.exports = {
    createComplaint
};
