import { CardSkeleton } from '@/components/UI/Skeleton'
import { historicalMomentsApi } from '@/services/api'
import { motion } from 'framer-motion'
import { Calendar, Filter, Image, Play } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

const HistoryPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [moments, setMoments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedMediaType, setSelectedMediaType] = useState<string>('')

  const mediaTypes = [
    { value: '', label: t('historyPage.filters.allMedia') },
    { value: 'image', label: t('historyPage.filters.images') },
    { value: 'video', label: t('historyPage.filters.videos') }
  ]

  const fetchMoments = async () => {
    setIsLoading(true)
    try {
      const params: any = {
        page: currentPage,
        limit: 12
      }
      
      if (selectedMediaType) {
        params.mediaType = selectedMediaType
      }

      const response = await historicalMomentsApi.getAll(params)
      
      if (response.data.success) {
        setMoments(response.data.data)
        setTotalPages(response.data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Error fetching historical moments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMoments()
  }, [currentPage, selectedMediaType])

  const handleMomentClick = (momentId: string) => {
    navigate(`/history/${momentId}`)
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
            {t('historyPage.title')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {t('historyPage.description')}
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
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500 " />
              <select
                value={selectedMediaType}
                onChange={(e) => {
                  setSelectedMediaType(e.target.value)
                  setCurrentPage(1)
                }}
                className="input py-2 px-3 text-sm dark:bg-gray-800 dark:text-gray-400"
              >
                {mediaTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('historyPage.showingPage', { current: currentPage, total: totalPages })}
            </p>
          </div>
        </motion.div>

        {/* Moments Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : moments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Image className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('historyPage.noMomentsFound')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {t('historyPage.noMomentsDescription')}
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {moments.map((moment, index) => (
              <motion.div
                key={moment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onClick={() => handleMomentClick(moment._id)}
                className="card overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
              >
                {/* Media */}
                <div className="relative aspect-square bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  {moment.mediaType === 'video' ? (
                    <div className="relative w-full h-full">
                      <img
                        src={moment.thumbnailUrl || moment.mediaUrl}
                        alt={moment.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Play className="w-6 h-6 text-gray-800 ml-1" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={moment.mediaUrl}
                      alt={moment.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  
                  {moment.isHighlighted && (
                    <div className="absolute top-2 right-2">
                      <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                        <span className="text-xs">⭐</span>
                      </div>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="bg-white/90 backdrop-blur-sm text-gray-800 px-4 py-2 rounded-full text-sm font-medium transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                      {t('common.viewDetails')}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {moment.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                    {moment.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(moment.date).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {moment.mediaType === 'video' ? (
                        <Play className="w-4 h-4" />
                      ) : (
                        <Image className="w-4 h-4" />
                      )}
                      <span>{t(`historyPage.${moment.mediaType}`)}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {moment.tags && moment.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {moment.tags.slice(0, 2).map((tag: string, tagIndex: number) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                        >
                          #{tag}
                        </span>
                      ))}
                      {moment.tags.length > 2 && (
                        <span className="px-2 py-1 text-xs text-gray-500">
                          {t('historyPage.moreImages', { count: moment.tags.length - 2 })}
                        </span>
                      )}
                    </div>
                  )}
                </div>
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


export default HistoryPage 