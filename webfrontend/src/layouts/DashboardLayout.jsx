import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquareWarning,
  MapPin,
  Building2,
  Map,
  PanelLeftClose,
  PanelLeftOpen,
  Activity,
  Search,
  Bell,
} from 'lucide-react';

/**
 * DashboardLayout — Main admin layout with collapsible sidebar, top header,
 * and content area. Uses semantic HTML and is keyboard accessible.
 *
 * FUTURE INTEGRATION:
 * - Replace the static status indicator with a live backend health check.
 * - Add user avatar / profile dropdown when auth is implemented.
 * - Add notification badge when notifications system is ready.
 */

const navItems = [
  { path: '/admin/overview', label: 'Overview', icon: LayoutDashboard },
  { path: '/admin/complaints', label: 'Complaints', icon: MessageSquareWarning },
  { path: '/admin/zones', label: 'Zones', icon: MapPin },
  { path: '/admin/departments', label: 'Departments', icon: Building2 },
  { path: '/admin/map', label: 'Map', icon: Map, disabled: true, badge: 'Soon' },
];

export default function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Derive breadcrumb from current path
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const currentPageLabel = navItems.find((item) =>
    location.pathname.startsWith(item.path)
  )?.label || pathSegments[pathSegments.length - 1] || 'Dashboard';

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden">
      {/* ─── Sidebar ─── */}
      <aside
        className={`${sidebarCollapsed ? 'w-sidebar-collapsed' : 'w-sidebar'
          } bg-sidebar flex flex-col border-r border-sidebar-border transition-all duration-300 ease-in-out flex-shrink-0`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo area */}
        <div className="h-16 flex items-center px-4 border-b border-white/10 flex-shrink-0">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent-500 flex items-center justify-center">
                <Activity className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white tracking-tight">ZenAdmin</h1>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">Dashboard</p>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <div className="w-8 h-8 rounded-lg bg-accent-500 flex items-center justify-center">
                <Activity className="w-4.5 h-4.5 text-white" />
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-thin" aria-label="Admin pages">
          {navItems.map((item) => {
            const Icon = item.icon;
            if (item.disabled) {
              return (
                <div
                  key={item.path}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 cursor-not-allowed opacity-50"
                  title={`${item.label} — Coming Soon`}
                  aria-disabled="true"
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="text-sm flex items-center gap-2">
                      {item.label}
                      <span className="text-[9px] px-1.5 py-0.5 bg-gray-700 text-gray-400 rounded-full uppercase font-bold tracking-wider">
                        {item.badge}
                      </span>
                    </span>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${isActive
                    ? 'bg-accent-600 text-white shadow-lg shadow-accent-600/25'
                    : 'text-gray-400 hover:bg-sidebar-hover hover:text-white'
                  }`
                }
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar toggle */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={() => setSidebarCollapsed((c) => !c)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:bg-sidebar-hover hover:text-white transition-colors text-sm"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="w-5 h-5" />
            ) : (
              <>
                <PanelLeftClose className="w-5 h-5" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ─── Main area ─── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center gap-1.5 text-sm">
                <li className="text-gray-400">Admin</li>
                <li className="text-gray-300">/</li>
                <li className="font-semibold text-gray-900">{currentPageLabel}</li>
              </ol>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Search placeholder — FUTURE: connect to global search */}
            <button
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              aria-label="Search"
              title="Search (coming soon)"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notification placeholder — FUTURE: connect to notifications */}
            <button
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors relative"
              aria-label="Notifications"
              title="Notifications (coming soon)"
            >
              <Bell className="w-5 h-5" />
            </button>

            {/* System status indicator */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200"
              role="status"
              aria-label="System status: demo mode"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-medium text-amber-700">Demo Mode</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin" id="main-content">
          <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
