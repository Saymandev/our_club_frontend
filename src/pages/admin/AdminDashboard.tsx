import { CardSkeleton, DashboardStatsSkeleton } from '@/components/UI/Skeleton'
import { announcementsApi, historicalMomentsApi } from '@/services/api'
import { motion } from 'framer-motion'
import {
  Camera,
  Megaphone,
  Star,
  TrendingUp
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalAnnouncements: 0,
    publishedAnnouncements: 0,
    totalMoments: 0,
    highlightedMoments: 0
  })
  const [recentAnnouncements, setRecentAnnouncements] = useState<any[]>([])
  const [recentMoments, setRecentMoments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [announcementsRes, momentsRes] = await Promise.all([
          announcementsApi.getAllAdmin({ limit: 5 }),
          historicalMomentsApi.getAllAdmin({ limit: 4 })
        ])

        // Get recent data
        if (announcementsRes.data.success) {
          setRecentAnnouncements(announcementsRes.data.data)
        }

        if (momentsRes.data.success) {
          setRecentMoments(momentsRes.data.data)
        }

        // Get stats (simplified for demo)
        setStats({
          totalAnnouncements: announcementsRes.data.pagination?.totalItems || 0,
          publishedAnnouncements: announcementsRes.data.data.filter((a: any) => a.isPublished).length,
          totalMoments: momentsRes.data.pagination?.totalItems || 0,
          highlightedMoments: momentsRes.data.data.filter((m: any) => m.isHighlighted).length
        })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const quickActions = [
    {
      title: 'New Announcement',
      description: 'Create a new announcement',
      href: '/admin/announcements',
      icon: Megaphone,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Add Historical Moment',
      description: 'Upload a new memory',
      href: '/admin/historical-moments',
      icon: Camera,
      color: 'bg-green-500 hover:bg-green-600'
    }
  ]

  if (isLoading) {
    return (
      <div className="space-y-8">
        <DashboardStatsSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Welcome back! Here's what's happening with your club.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Announcements</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalAnnouncements}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Megaphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Published</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.publishedAnnouncements}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Historical Moments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalMoments}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <Camera className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Highlighted</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.highlightedMoments}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <Link
                key={index}
                to={action.href}
                className={`${action.color} text-white p-6 rounded-lg transition-all duration-200 hover:scale-[1.02] shadow-lg`}
              >
                <div className="flex items-center space-x-4">
                  <Icon className="w-8 h-8" />
                  <div>
                    <h3 className="font-semibold">{action.title}</h3>
                    <p className="text-sm opacity-90">{action.description}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </motion.div>

      {/* Recent Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Announcements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Announcements
            </h2>
            <Link
              to="/admin/announcements"
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentAnnouncements.slice(0, 3).map((announcement) => (
              <div
                key={announcement._id}
                className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                    {announcement.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  announcement.isPublished 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
                }`}>
                  {announcement.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Historical Moments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Moments
            </h2>
            <Link
              to="/admin/historical-moments"
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentMoments.slice(0, 3).map((moment) => (
              <div
                key={moment._id}
                className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <img
                  src={moment.thumbnailUrl || moment.mediaUrl}
                  alt={moment.title}
                  className="w-10 h-10 rounded-md object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                    {moment.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(moment.date).toLocaleDateString()}
                  </p>
                </div>
                {moment.isHighlighted && (
                  <Star className="w-4 h-4 text-yellow-500" />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AdminDashboard 