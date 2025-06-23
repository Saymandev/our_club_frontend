import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'

// Layout Components
import AdminLayout from '@/components/Layout/AdminLayout'
import Layout from '@/components/Layout/Layout'

// Public Pages
import AnnouncementDetailPage from '@/pages/AnnouncementDetailPage'
import AnnouncementsPage from '@/pages/AnnouncementsPage'
import BloodDonorsPage from '@/pages/BloodDonorsPage'
import DonationsPage from '@/pages/DonationsPage'
import EventDetailPage from '@/pages/EventDetailPage'
import EventsPage from '@/pages/EventsPage'
import HistoricalMomentDetailPage from '@/pages/HistoricalMomentDetailPage'
import HistoryPage from '@/pages/HistoryPage'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import MyBloodDonationPage from '@/pages/MyBloodDonationPage'
import RegisterPage from '@/pages/RegisterPage'

// Admin Pages
import AdminAnnouncements from '@/pages/admin/AdminAnnouncements'
import AdminBloodDonation from '@/pages/admin/AdminBloodDonation'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminDonations from '@/pages/admin/AdminDonations'
import AdminEvents from '@/pages/admin/AdminEvents'
import AdminHistoricalMoments from '@/pages/admin/AdminHistoricalMoments'
import AdminPaymentVerification from '@/pages/admin/AdminPaymentVerification'
import AdminSettings from '@/pages/admin/AdminSettings'
import AdminSlider from '@/pages/admin/AdminSlider'

// Components
import ProtectedRoute from '@/components/Auth/ProtectedRoute'
import LoadingSpinner from '@/components/UI/LoadingSpinner'

function App() {
  const { theme, initializeTheme } = useThemeStore()
  const { initializeAuth, isLoading } = useAuthStore()

  useEffect(() => {
    initializeTheme()
    initializeAuth()
  }, [initializeTheme, initializeAuth])

  useEffect(() => {
    // Apply theme class to document element
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="announcements" element={<AnnouncementsPage />} />
          <Route path="announcements/:id" element={<AnnouncementDetailPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="events/:id" element={<EventDetailPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="history/:id" element={<HistoricalMomentDetailPage />} />
          <Route path="blood-donors" element={<BloodDonorsPage />} />
          <Route path="donations" element={<DonationsPage />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected User Routes */}
        <Route
          path="/my-blood-donation"
          element={
            <ProtectedRoute>
              <MyBloodDonationPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="historical-moments" element={<AdminHistoricalMoments />} />
          <Route path="slider" element={<AdminSlider />} />
          <Route path="blood-donation" element={<AdminBloodDonation />} />
          <Route path="donations" element={<AdminDonations />} />
          <Route path="payment-verification" element={<AdminPaymentVerification />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Page not found</p>
              <a
                href="/"
                className="btn-primary"
              >
                Go Home
              </a>
            </div>
          </div>
        } />
      </Routes>
    </div>
  )
}

export default App 