import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { App } from '../App'
import { ProtectedRoute } from '../components/routing/ProtectedRoute'
import { AuthRoute } from '../components/routing/AuthRoute'
import { RootRoute } from '../components/routing/RootRoute'

const DashboardPage = lazy(() => import('../pages/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const PropertiesPage = lazy(() => import('../pages/PropertiesPage').then((m) => ({ default: m.PropertiesPage })))
const PropertyFormPage = lazy(() => import('../pages/PropertyFormPage').then((m) => ({ default: m.PropertyFormPage })))
const PropertyDetailPage = lazy(() => import('../pages/PropertyDetailPage').then((m) => ({ default: m.PropertyDetailPage })))
const ImportsPage = lazy(() => import('../pages/ImportsPage').then((m) => ({ default: m.ImportsPage })))
const ReportsListPage = lazy(() => import('../pages/ReportsListPage').then((m) => ({ default: m.ReportsListPage })))
const GenerateReportPage = lazy(() => import('../pages/GenerateReportPage').then((m) => ({ default: m.GenerateReportPage })))
const ReportDetailPage = lazy(() => import('../pages/ReportDetailPage').then((m) => ({ default: m.ReportDetailPage })))
const SettingsProfilePage = lazy(() => import('../pages/SettingsProfilePage').then((m) => ({ default: m.SettingsProfilePage })))
const SettingsTenantPage = lazy(() => import('../pages/SettingsTenantPage').then((m) => ({ default: m.SettingsTenantPage })))
const BillingSettingsPage = lazy(() => import('../pages/BillingSettingsPage').then((m) => ({ default: m.BillingSettingsPage })))
const TeamSettingsPage = lazy(() => import('../pages/TeamSettingsPage').then((m) => ({ default: m.TeamSettingsPage })))
const UsersPage = lazy(() => import('../pages/settings/UsersPage').then((m) => ({ default: m.UsersPage })))
const OnboardingWelcomePage = lazy(() => import('../pages/OnboardingWelcomePage').then((m) => ({ default: m.OnboardingWelcomePage })))
const WelcomePage = lazy(() => import('../pages/WelcomePage').then((m) => ({ default: m.WelcomePage })))
const SignInPage = lazy(() => import('../pages/SignInPage').then((m) => ({ default: m.SignInPage })))
const SignUpPage = lazy(() => import('../pages/SignUpPage').then((m) => ({ default: m.SignUpPage })))
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })))
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })))
const VerifyEmailPage = lazy(() => import('../pages/VerifyEmailPage').then((m) => ({ default: m.VerifyEmailPage })))
const PricingPage = lazy(() => import('../pages/PricingPage').then((m) => ({ default: m.PricingPage })))
const PrivacyPage = lazy(() => import('../pages/legal/PrivacyPage').then((m) => ({ default: m.PrivacyPage })))
const TermsPage = lazy(() => import('../pages/legal/TermsPage').then((m) => ({ default: m.TermsPage })))
const HelpIndexPage = lazy(() => import('../pages/help/HelpIndexPage').then((m) => ({ default: m.HelpIndexPage })))
const HelpArticlePage = lazy(() => import('../pages/help/HelpArticlePage').then((m) => ({ default: m.HelpArticlePage })))
const AddPropertyStep = lazy(() => import('../pages/onboarding/AddPropertyStep').then((m) => ({ default: m.AddPropertyStep })))
const UploadDataStep = lazy(() => import('../pages/onboarding/UploadDataStep').then((m) => ({ default: m.UploadDataStep })))
const GenerateReportStep = lazy(() => import('../pages/onboarding/GenerateReportStep').then((m) => ({ default: m.GenerateReportStep })))
const OnboardingSuccess = lazy(() => import('../pages/onboarding/OnboardingSuccess').then((m) => ({ default: m.OnboardingSuccess })))
const DemoEntryPage = lazy(() => import('../pages/DemoEntryPage').then((m) => ({ default: m.DemoEntryPage })))
const HowToPage = lazy(() => import('../pages/HowToPage').then((m) => ({ default: m.HowToPage })))
const UploadPage = lazy(() => import('../pages/UploadPage').then((m) => ({ default: m.UploadPage })))

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
    element: <RootRoute />,
  },
  {
    path: '/pricing',
    element: <Lazy><PricingPage /></Lazy>,
  },
  {
    path: '/demo',
    element: <Lazy><DemoEntryPage /></Lazy>,
  },
  {
    path: '/legal',
    children: [
      { path: 'privacy', element: <Lazy><PrivacyPage /></Lazy> },
      { path: 'terms', element: <Lazy><TermsPage /></Lazy> },
    ],
  },
  {
    path: '/help',
    children: [
      { index: true, element: <Lazy><HelpIndexPage /></Lazy> },
      { path: ':slug', element: <Lazy><HelpArticlePage /></Lazy> },
    ],
  },
  {
    path: '/auth/verify-email',
    element: <Lazy><VerifyEmailPage /></Lazy>,
  },
  {
    path: '/auth',
    element: <AuthRoute />,
    children: [
      { path: 'signin', element: <Lazy><SignInPage /></Lazy> },
      { path: 'signup', element: <Lazy><SignUpPage /></Lazy> },
      { path: 'forgot-password', element: <Lazy><ForgotPasswordPage /></Lazy> },
      { path: 'reset-password', element: <Lazy><ResetPasswordPage /></Lazy> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/onboarding',
        children: [
          { path: 'welcome', element: <Lazy><WelcomePage /></Lazy> },
          { path: 'onboarding-welcome', element: <Lazy><OnboardingWelcomePage /></Lazy> },
          { path: 'add-property', element: <Lazy><AddPropertyStep /></Lazy> },
          { path: 'upload-data', element: <Lazy><UploadDataStep /></Lazy> },
          { path: 'generate-report', element: <Lazy><GenerateReportStep /></Lazy> },
          { path: 'success', element: <Lazy><OnboardingSuccess /></Lazy> },
        ],
      },
      {
        element: <App />,
        children: [
          { path: '/dashboard', element: <Lazy><DashboardPage /></Lazy> },
          { path: '/how-to', element: <Lazy><HowToPage /></Lazy> },
          { path: '/properties', element: <Lazy><PropertiesPage /></Lazy> },
          { path: '/properties/new', element: <Lazy><PropertyFormPage /></Lazy> },
          { path: '/properties/:id', element: <Lazy><PropertyDetailPage /></Lazy> },
          { path: '/properties/:id/edit', element: <Lazy><PropertyFormPage /></Lazy> },
          { path: '/imports', element: <Lazy><ImportsPage /></Lazy> },
          { path: '/imports/upload', element: <Lazy><UploadPage /></Lazy> },
          { path: '/reports', element: <Lazy><ReportsListPage /></Lazy> },
          { path: '/reports/new', element: <Lazy><GenerateReportPage /></Lazy> },
          { path: '/reports/:id', element: <Lazy><ReportDetailPage /></Lazy> },
          { path: '/settings/profile', element: <Lazy><SettingsProfilePage /></Lazy> },
          { path: '/settings/tenant', element: <Lazy><SettingsTenantPage /></Lazy> },
          { path: '/settings/billing', element: <Lazy><BillingSettingsPage /></Lazy> },
          { path: '/settings/team', element: <Lazy><TeamSettingsPage /></Lazy> },
          { path: '/settings/users', element: <Lazy><UsersPage /></Lazy> },
        ],
      },
    ],
  },
])
