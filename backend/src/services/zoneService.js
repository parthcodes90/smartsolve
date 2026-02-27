const prisma = require('../config/prisma');

/**
 * Zone Resolution Service
 * Determines the specific municipality zone for a latitude/longitude pair
 */
class ZoneService {
    constructor() {
        this.defaultZoneName = process.env.DEFAULT_MUNICIPAL_ZONE || 'DEFAULT_MUNICIPAL_ZONE';
    }

    async resolveZoneByCoords(lat, lng) {
        try {
            // 1. Fetch all zones with boundary metadata
            const zones = await prisma.zone.findMany();

            // 2. Logic: Search for the zone containing coordinates
            // Phase-1: Simple within-bounding-box logic
            // Phase-2: Replace with PostGIS ST_Contains search in DB
            let resolvedZone = null;

            for (const zone of zones) {
                if (this._isPointInZone(lat, lng, zone.boundary)) {
                    resolvedZone = zone;
                    break;
                }
            }

            // 3. Fallback to DEFAULT
            if (!resolvedZone) {
                resolvedZone = await prisma.zone.findUnique({
                    where: { name: this.defaultZoneName }
                });
            }

            return resolvedZone;

        } catch (error) {
            console.error('[ZONE_ERROR]: Location resolution failed', error);
            return null;
        }
    }

    /**
     * Helper: Bounding Box check (Phase-1 Logic)
     * Boundary expected: { minLat, maxLat, minLng, maxLng } OR [ [lat,lng], [lat,lng] ]
     */
    _isPointInZone(lat, lng, boundary) {
        if (!boundary) return false;

        // Simple Bounding Box check
        if (boundary.minLat && boundary.maxLat && boundary.minLng && boundary.maxLng) {
            return (
                lat >= boundary.minLat &&
                lat <= boundary.maxLat &&
                lng >= boundary.minLng &&
                lng <= boundary.maxLng
            );
        }

        // For polygons, a more complex library could be used (e.g., 'point-in-polygon')
        // but Phase-1 strictly calls for bounding-box/static logic
        return false;
    }
}

module.exports = new ZoneService();
