import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

export function ProtectedRoute() {
  const { user, initialised } = useSelector((state: RootState) => state.auth)

  if (!initialised) return null

  if (!user) return <Navigate to="/auth/signin" replace />

  return <Outlet />
}
