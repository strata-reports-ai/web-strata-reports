import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { App } from '../App'
import { ProtectedRoute } from '../components/routing/ProtectedRoute'
import { AuthRoute } from '../components/routing/AuthRoute'

const DashboardPage = lazy(() => import('../pages/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const PropertiesPage = lazy(() => import('../pages/PropertiesPage').then((m) => ({ default: m.PropertiesPage })))
const PropertyFormPage = lazy(() => import('../pages/PropertyFormPage').then((m) => ({ default: m.PropertyFormPage })))
const PropertyDetailPage = lazy(() => import('../pages/PropertyDetailPage').then((m) => ({ default: m.PropertyDetailPage })))
const ImportsPage = lazy(() => import('../pages/ImportsPage').then((m) => ({ default: m.ImportsPage })))
const ReportsPage = lazy(() => import('../pages/ReportsPage').then((m) => ({ default: m.ReportsPage })))
const GenerateReportPage = lazy(() => import('../pages/GenerateReportPage').then((m) => ({ default: m.GenerateReportPage })))
const ReportDetailPage = lazy(() => import('../pages/ReportDetailPage').then((m) => ({ default: m.ReportDetailPage })))
const SettingsProfilePage = lazy(() => import('../pages/SettingsProfilePage').then((m) => ({ default: m.SettingsProfilePage })))
const SettingsTenantPage = lazy(() => import('../pages/SettingsTenantPage').then((m) => ({ default: m.SettingsTenantPage })))
const OnboardingWelcomePage = lazy(() => import('../pages/OnboardingWelcomePage').then((m) => ({ default: m.OnboardingWelcomePage })))
const SignInPage = lazy(() => import('../pages/SignInPage').then((m) => ({ default: m.SignInPage })))
const SignUpPage = lazy(() => import('../pages/SignUpPage').then((m) => ({ default: m.SignUpPage })))
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })))
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })))

function PageLoader() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <CircularProgress />
    </Box>
  )
}

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/auth',
    element: <AuthRoute />,
    children: [
      {
        path: 'signin',
        element: <Lazy><SignInPage /></Lazy>,
      },
      {
        path: 'signup',
        element: <Lazy><SignUpPage /></Lazy>,
      },
      {
        path: 'forgot-password',
        element: <Lazy><ForgotPasswordPage /></Lazy>,
      },
      {
        path: 'reset-password',
        element: <Lazy><ResetPasswordPage /></Lazy>,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <App />,
        children: [
          { path: '/dashboard', element: <Lazy><DashboardPage /></Lazy> },
          { path: '/properties', element: <Lazy><PropertiesPage /></Lazy> },
          { path: '/properties/new', element: <Lazy><PropertyFormPage /></Lazy> },
          { path: '/properties/:id', element: <Lazy><PropertyDetailPage /></Lazy> },
          { path: '/properties/:id/edit', element: <Lazy><PropertyFormPage /></Lazy> },
          { path: '/imports', element: <Lazy><ImportsPage /></Lazy> },
          { path: '/reports', element: <Lazy><ReportsPage /></Lazy> },
          { path: '/reports/new', element: <Lazy><GenerateReportPage /></Lazy> },
          { path: '/reports/:id', element: <Lazy><ReportDetailPage /></Lazy> },
          { path: '/settings/profile', element: <Lazy><SettingsProfilePage /></Lazy> },
          { path: '/settings/tenant', element: <Lazy><SettingsTenantPage /></Lazy> },
          { path: '/onboarding/welcome', element: <Lazy><OnboardingWelcomePage /></Lazy> },
        ],
      },
    ],
  },
])
