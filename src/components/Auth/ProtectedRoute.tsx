import { Skeleton } from '@/components/UI/Skeleton'
import { useAuthStore } from '@/store/authStore'
import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: 'admin' | 'moderator' | string[]
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuthStore()
  const location = useLocation()

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check role-based access
  if (requiredRole && user?.role) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    if (!allowedRoles.includes(user.role)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">403</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Access Denied</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              You don't have permission to access this page.
            </p>
            <a
              href="/"
              className="btn-primary"
            >
              Go Home
            </a>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}

export default ProtectedRoute 