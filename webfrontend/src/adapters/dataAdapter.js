/**
 * Data Adapter — Abstraction layer for data fetching.
 *
 * Each function attempts a backend API call first. On failure (network error,
 * non-OK response, etc.), it falls back to mock data transparently.
 *
 * The transform layer normalizes whatever the backend returns into the
 * UI-expected shape defined in mockData.js.
 *
 * FUTURE INTEGRATION GUIDE:
 * 1. When backend stabilizes, update the transform functions to map
 *    actual API response fields to UI schema fields.
 * 2. Remove or reduce mock fallbacks as endpoints become reliable.
 * 3. Add pagination params when backend supports server-side pagination.
 * 4. Add auth headers when authentication is implemented.
 */

import {
    mockComplaints,
    mockZones,
    mockDepartments,
    mockOverviewStats,
} from './mockData';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Generic fetch helper with error handling.
 * Returns { data, error, isFromMock } so consumers know the data source.
 */
async function fetchFromAPI(endpoint) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const result = await response.json();
        // Handle both { data: [...] } and { success: true, data: [...] } shapes
        const data = result.data ?? result;
        return { data, error: null, isFromMock: false };
    } catch (err) {
        return { data: null, error: err.message, isFromMock: true };
    }
}

// ─────────────────────────────────────────────
// TRANSFORM FUNCTIONS
// Map backend shapes → UI shapes.
// Update these when backend API schemas finalize.
// ─────────────────────────────────────────────

/**
 * Transform a backend complaint object to UI schema.
 * FUTURE: Update field mappings here when backend fields change.
 */
function transformComplaint(raw) {
    return {
        id: raw.id || raw._id || 'N/A',
        title: raw.title || raw.category || 'Untitled Complaint',
        category: raw.category || 'Uncategorized',
        status: raw.status || 'Open',
        priority: raw.priority || raw.aiAnalysis?.priorityLevel || 'N/A',
        zone: raw.zone || raw.location?.zone || 'Unassigned',
        department: raw.department || raw.assignedDepartment || 'Unassigned',
        reportedAt: raw.reportedAt || raw.createdAt || raw.created_at || null,
        reportedBy: raw.reportedBy || raw.userId || 'Anonymous',
        description: raw.description || '',
        location: raw.location?.address || raw.location || '',
        // Preserve any extra fields for the detail view
        _raw: raw,
    };
}

function transformZone(raw) {
    return {
        id: raw.id || raw._id || 'N/A',
        name: raw.name || 'Unnamed Zone',
        area: raw.area || 'N/A',
        activeComplaints: raw.activeComplaints ?? 0,
        totalComplaints: raw.totalComplaints ?? 0,
        status: raw.status || 'Active',
        head: raw.head || 'Unassigned',
    };
}

function transformDepartment(raw) {
    return {
        id: raw.id || raw._id || 'N/A',
        name: raw.name || 'Unnamed Department',
        head: raw.head || 'Unassigned',
        activeComplaints: raw.activeComplaints ?? 0,
        avgResolutionTime: raw.avgResolutionTime || 'N/A',
        staff: raw.staff ?? 0,
    };
}

// ─────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────

/**
 * Fetch all complaints.
 * @returns {{ data: Array, error: string|null, isFromMock: boolean }}
 */
export async function getComplaints() {
    const result = await fetchFromAPI('/complaints');
    if (result.error || !result.data) {
        return { data: mockComplaints, error: result.error, isFromMock: true };
    }
    const data = Array.isArray(result.data)
        ? result.data.map(transformComplaint)
        : [];
    return { data, error: null, isFromMock: false };
}

/**
 * Fetch a single complaint by ID.
 * @param {string} id
 * @returns {{ data: Object|null, error: string|null, isFromMock: boolean }}
 */
export async function getComplaintById(id) {
    const result = await fetchFromAPI(`/complaints/${id}`);
    if (result.error || !result.data) {
        const mock = mockComplaints.find((c) => c.id === id) || mockComplaints[0];
        return { data: { ...mock, id }, error: result.error, isFromMock: true };
    }
    return { data: transformComplaint(result.data), error: null, isFromMock: false };
}

/**
 * Fetch all zones.
 * @returns {{ data: Array, error: string|null, isFromMock: boolean }}
 */
export async function getZones() {
    const result = await fetchFromAPI('/zones');
    if (result.error || !result.data) {
        return { data: mockZones, error: result.error, isFromMock: true };
    }
    const data = Array.isArray(result.data)
        ? result.data.map(transformZone)
        : [];
    return { data, error: null, isFromMock: false };
}

/**
 * Fetch all departments.
 * @returns {{ data: Array, error: string|null, isFromMock: boolean }}
 */
export async function getDepartments() {
    const result = await fetchFromAPI('/departments');
    if (result.error || !result.data) {
        return { data: mockDepartments, error: result.error, isFromMock: true };
    }
    const data = Array.isArray(result.data)
        ? result.data.map(transformDepartment)
        : [];
    return { data, error: null, isFromMock: false };
}

/**
 * Get overview stats for the dashboard.
 * Currently aggregated from mock data. When a dedicated stats endpoint
 * exists, this should call that instead.
 *
 * @returns {{ data: Object, error: string|null, isFromMock: boolean }}
 */
export async function getOverviewStats() {
    // FUTURE: Replace with API call like fetchFromAPI('/stats/overview')
    // when a stats endpoint is available.
    const complaintsResult = await getComplaints();
    const complaints = complaintsResult.data;

    // Compute stats from complaint data
    const total = complaints.length;
    const open = complaints.filter((c) => ['open', 'pending'].includes(c.status.toLowerCase())).length;
    const inProgress = complaints.filter((c) => ['in progress', 'in_progress', 'assigned', 'ai_analysis'].includes(c.status.toLowerCase())).length;
    const resolved = complaints.filter((c) => ['resolved', 'closed'].includes(c.status.toLowerCase())).length;

    return {
        data: {
            totalComplaints: total,
            openComplaints: open,
            inProgressComplaints: inProgress,
            resolvedComplaints: resolved,
            trends: mockOverviewStats.trends, // Trends come from mock until analytics endpoint exists
        },
        error: complaintsResult.error,
        isFromMock: complaintsResult.isFromMock,
    };
}
