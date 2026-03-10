import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'

interface Props {
  children: React.ReactNode
  roles?: string[]
}

export default function PrivateRoute({ children, roles }: Props) {
  const { user, token } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/" replace />
  return <>{children}</>
}
