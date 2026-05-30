import { createBrowserRouter } from 'react-router-dom'
import { App } from '../App'
import { DashboardPage } from '../pages/DashboardPage'
import { PropertiesPage } from '../pages/PropertiesPage'
import { PropertyFormPage } from '../pages/PropertyFormPage'
import { ImportsPage } from '../pages/ImportsPage'
import { ReportsListPage } from '../pages/ReportsListPage'
import { GenerateReportPage } from '../pages/GenerateReportPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'properties', element: <PropertiesPage /> },
      { path: 'properties/new', element: <PropertyFormPage /> },
      { path: 'properties/:id/edit', element: <PropertyFormPage /> },
      { path: 'imports', element: <ImportsPage /> },
      { path: 'reports', element: <ReportsListPage /> },
      { path: 'reports/new', element: <GenerateReportPage /> },
    ],
  },
])
