const prisma = require('../src/config/prisma');

/**
 * Seed data for Phase-1 testing
 * Includes: Default Zones and Example Departments
 */
async function main() {
    console.log('[SEED] Starting database seeding...');

    // 1. Create the Default Municipal Zone (Static Bounding Box Logic)
    const defaultZone = await prisma.zone.upsert({
        where: { name: 'MUNICIPAL_HQ_ZONE' },
        update: {},
        create: {
            name: 'MUNICIPAL_HQ_ZONE',
            boundary: {
                minLat: -90, maxLat: 90, minLng: -180, maxLng: 180
            } // Global Catch-all for phase-1 mock testing
        }
    });
    console.log(`[SEED] Created master zone: ${defaultZone.name}`);

    // 3. Create Key Departments
    const departments = [
        { name: 'Public Works', zoneId: defaultZone.id },
        { name: 'Waste Management', zoneId: defaultZone.id },
        { name: 'Electrical Engineering', zoneId: defaultZone.id },
        { name: 'Water & Sewage', zoneId: defaultZone.id },
        { name: 'Municipal Control Department', zoneId: defaultZone.id } // Fallback Dept
    ];

    for (const dept of departments) {
        await prisma.department.upsert({
            where: {
                name_zoneId: { name: dept.name, zoneId: dept.zoneId }
            },
            update: {},
            create: {
                name: dept.name,
                zoneId: dept.zoneId
            }
        });
    }
    console.log(`[SEED] Created ${departments.length} departments for initial assignment logic.`);

    console.log('[SEED] Seeding completed successfully.');
}

main()
    .catch((e) => {
        console.error('[SEED_ERROR]:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
