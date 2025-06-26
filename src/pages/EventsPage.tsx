import { EventCardSkeleton } from '@/components/UI/Skeleton'
import { eventsApi } from '@/services/api'
import { motion } from 'framer-motion'
import { Calendar, Clock, Filter, MapPin, Star, Tag, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

const EventsPage = () => {
  const { t } = useTranslation()
  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')

  const categories = [
    { value: '', label: t('eventsPage.filters.allCategories') },
    { value: 'environment', label: t('eventsPage.categories.environment') },
    { value: 'education', label: t('eventsPage.categories.education') },
    { value: 'social', label: t('eventsPage.categories.social') },
    { value: 'health', label: t('eventsPage.categories.health') },
    { value: 'cultural', label: t('eventsPage.categories.cultural') },
    { value: 'sports', label: t('eventsPage.categories.sports') },
    { value: 'other', label: t('eventsPage.categories.other') }
  ]

  const statuses = [
    { value: '', label: t('eventsPage.filters.allStatuses') },
    { value: 'upcoming', label: t('eventsPage.statuses.upcoming') },
    { value: 'ongoing', label: t('eventsPage.statuses.ongoing') },
    { value: 'completed', label: t('eventsPage.statuses.completed') }
  ]

  const fetchEvents = async () => {
    setIsLoading(true)
    try {
      const params: any = {
        page: currentPage,
        limit: 12
      }
      
      if (selectedCategory) {
        params.category = selectedCategory
      }
      
      if (selectedStatus) {
        params.status = selectedStatus
      }

      const response = await eventsApi.getAll(params)
      
      if (response.data.success) {
        setEvents(response.data.data)
        setTotalPages(response.data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [currentPage, selectedCategory, selectedStatus])

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'environment':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'education':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'social':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      case 'health':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'cultural':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'sports':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'ongoing':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-heading font-bold text-gray-900 dark:text-white mb-4">
            {t('eventsPage.title')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {t('eventsPage.description')}
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="input py-2 px-3 text-sm dark:bg-gray-800 dark:text-gray-400"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value)
                  setCurrentPage(1)
                }}
                className="input py-2 px-3 text-sm dark:bg-gray-800 dark:text-gray-400"
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('eventsPage.showingPage', { current: currentPage, total: totalPages })}
            </p>
          </div>
        </motion.div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('eventsPage.noEventsFound')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {t('eventsPage.noEventsDescription')}
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event, index) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <Link
                  to={`/events/${event._id}`}
                  className="card-hover h-full flex flex-col"
                >
                  {/* Event Image */}
                  {event.images && event.images.length > 0 && (
                    <div className="relative h-48 rounded-t-lg overflow-hidden">
                      <img
                        src={event.images.find((img: any) => img.isMain)?.url || event.images[0]?.url}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {event.isFeatured && (
                        <div className="absolute top-3 right-3">
                          <div className="bg-yellow-400 text-yellow-900 p-1.5 rounded-full">
                            <Star className="w-4 h-4 fill-current" />
                          </div>
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(event.category)}`}>
                          {t(`eventsPage.categories.${event.category}`)}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(event.status)}`}>
                          {t(`eventsPage.statuses.${event.status}`)}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
                      {event.title}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 flex-1">
                      {event.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{formatDate(event.eventDate)}</span>
                        <Clock className="w-4 h-4 ml-3 mr-2" />
                        <span>{formatTime(event.eventDate)}</span>
                      </div>
                      
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="line-clamp-1">{event.location.address}</span>
                      </div>
                      
                      {event.registrationRequired && (
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <Users className="w-4 h-4 mr-2" />
                          <span>
                            {event.currentParticipants}
                            {event.maxParticipants && `/${event.maxParticipants}`} {t('eventsPage.participants')}
                          </span>
                        </div>
                      )}
                      
                      {event.tags && event.tags.length > 0 && (
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <Tag className="w-4 h-4 mr-2" />
                          <span className="line-clamp-1">
                            {event.tags.slice(0, 3).join(', ')}
                            {event.tags.length > 3 && '...'}
                          </span>
                        </div>
                      )}
                    </div>

                    {event.fee > 0 && (
                      <div className="mb-4">
                        <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                          ${event.fee}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      {event.registrationRequired && event.isRegistrationOpen && (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-full">
                          {t('eventsPage.registrationOpen')}
                        </span>
                      )}
                      
                      {event.daysUntilEvent > 0 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {event.daysUntilEvent} {event.daysUntilEvent === 1 ? t('eventsPage.dayLeft') : t('eventsPage.daysLeft')}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 flex justify-center"
          >
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t('common.previous')}
              </button>
              
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                      currentPage === page
                        ? 'bg-primary-600 text-white'
                        : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t('common.next')}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default EventsPage 