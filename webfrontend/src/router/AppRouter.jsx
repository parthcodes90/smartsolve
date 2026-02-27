import { createBrowserRouter, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';

// Admin Pages
import Overview from '../pages/admin/Overview';
import Zones from '../pages/admin/Zones';
import Map from '../pages/admin/Map';
import Departments from '../pages/admin/Departments';
import ComplaintsList from '../pages/admin/complaints/index';
import ComplaintDetail from '../pages/admin/complaints/Detail';
import NotFound from '../pages/NotFound';

export const AppRouter = createBrowserRouter([
    {
        path: '/',
        // Redirect root to admin overview by default for this scope
        element: <Navigate to="/admin/overview" replace />,
    },
    {
        path: '/admin',
        element: <DashboardLayout />,
        children: [
            {
                index: true,
                element: <Navigate to="overview" replace />,
            },
            {
                path: 'overview',
                element: <Overview />,
            },
            {
                path: 'zones',
                element: <Zones />,
            },
            {
                path: 'map',
                element: <Map />,
            },
            {
                path: 'departments',
                element: <Departments />,
            },
            {
                path: 'complaints',
                element: <ComplaintsList />,
            },
            {
                path: 'complaints/:id', // Drill-down capability
                element: <ComplaintDetail />,
            },
            {
                path: '*',
                element: <NotFound />,
            },
        ],
    },
    {
        path: '*',
        element: <NotFound />,
    },
]);
