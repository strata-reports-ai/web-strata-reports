import { createBrowserRouter } from 'react-router-dom'
import { App } from '../App'
import { DashboardPage } from '../pages/DashboardPage'
import { PropertiesPage } from '../pages/PropertiesPage'
import { ImportsPage } from '../pages/ImportsPage'
import { ReportsPage } from '../pages/ReportsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'properties', element: <PropertiesPage /> },
      { path: 'imports', element: <ImportsPage /> },
      { path: 'reports', element: <ReportsPage /> },
    ],
  },
])
