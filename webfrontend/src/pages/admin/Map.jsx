import { Map as MapIcon } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';

/**
 * Map — Coming soon placeholder page.
 * Uses the EmptyState component for a professional placeholder.
 *
 * FUTURE INTEGRATION:
 * - Replace with actual map component (Leaflet, Mapbox, etc.)
 * - Do NOT implement map logic yet per project constraints.
 */

export default function MapPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Map View"
                subtitle="Geographic visualization of complaints and zones"
            />

            <div className="card">
                <div className="min-h-[500px] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                    <EmptyState
                        icon={<MapIcon className="w-12 h-12" />}
                        title="Map Visualization — Coming Soon"
                        description="Interactive geographic view of complaints, zones, and department coverage areas. This feature is under development and will be available in a future update."
                    />
                </div>
            </div>
        </div>
    );
}
