import { createBrowserRouter } from 'react-router-dom'
import { App } from '../App'
import { DashboardPage } from '../pages/DashboardPage'
import { PropertiesPage } from '../pages/PropertiesPage'
import { PropertyFormPage } from '../pages/PropertyFormPage'
import { ImportsPage } from '../pages/ImportsPage'
import { ReportsListPage } from '../pages/ReportsListPage'
import { GenerateReportPage } from '../pages/GenerateReportPage'
import { ReportDetailPage } from '../pages/ReportDetailPage'
import { SignInPage } from '../pages/SignInPage'
import { WelcomePage } from '../pages/WelcomePage'
import { BillingSettingsPage } from '../pages/BillingSettingsPage'
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
      { path: 'reports', element: <ReportsListPage /> },
      { path: 'reports/new', element: <GenerateReportPage /> },
      { path: 'reports/:id', element: <ReportDetailPage /> },
      { path: 'settings/billing', element: <BillingSettingsPage /> },
    ],
  },
])
