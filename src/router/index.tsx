import { createBrowserRouter } from 'react-router-dom'
import { App } from '../App'
import { DashboardPage } from '../pages/DashboardPage'
import { PropertiesPage } from '../pages/PropertiesPage'
import { PropertyFormPage } from '../pages/PropertyFormPage'
import { ImportsPage } from '../pages/ImportsPage'
import { ReportsPage } from '../pages/ReportsPage'
import { GenerateReportPage } from '../pages/GenerateReportPage'
import { SignInPage } from '../pages/SignInPage'
import { WelcomePage } from '../pages/WelcomePage'
import { ProtectedRoute } from '../components/routing/ProtectedRoute'

export const router = createBrowserRouter([
  {
    path: '/auth/signin',
    element: <SignInPage />,
  },
  {
    path: '/onboarding',
    element: <ProtectedRoute />,
    children: [
      { path: 'welcome', element: <WelcomePage /> },
    ],
  },
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'properties', element: <PropertiesPage /> },
      { path: 'properties/new', element: <PropertyFormPage /> },
      { path: 'properties/:id/edit', element: <PropertyFormPage /> },
      { path: 'imports', element: <ImportsPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'reports/new', element: <GenerateReportPage /> },
    ],
  },
])
