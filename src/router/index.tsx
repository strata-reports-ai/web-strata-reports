import { createBrowserRouter, Navigate } from 'react-router-dom'
import { App } from '../App'
import { ProtectedRoute } from '../components/routing/ProtectedRoute'
import { DashboardPage } from '../pages/DashboardPage'
import { PropertiesPage } from '../pages/PropertiesPage'
import { PropertyFormPage } from '../pages/PropertyFormPage'
import { ImportsPage } from '../pages/ImportsPage'
import { ReportsPage } from '../pages/ReportsPage'
import { GenerateReportPage } from '../pages/GenerateReportPage'
import { SignInPage } from '../pages/SignInPage'
import { RegisterPage } from '../pages/RegisterPage'

export const router = createBrowserRouter([
  {
    path: '/auth',
    children: [
      { path: 'signin', element: <SignInPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <App />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'properties', element: <PropertiesPage /> },
          { path: 'properties/new', element: <PropertyFormPage /> },
          { path: 'properties/:id/edit', element: <PropertyFormPage /> },
          { path: 'imports', element: <ImportsPage /> },
          { path: 'reports', element: <ReportsPage /> },
          { path: 'reports/new', element: <GenerateReportPage /> },
        ],
      },
    ],
  },
])
