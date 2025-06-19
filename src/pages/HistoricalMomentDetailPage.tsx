import LoadingSpinner from '@/components/UI/LoadingSpinner'
import { historicalMomentsApi } from '@/services/api'
import { useLanguageStore } from '@/store/languageStore'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, Camera, Clock, Eye, Hash, Star, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'


const HistoricalMomentDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { language } = useLanguageStore()
  const [moment, setMoment] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchMoment = async () => {
    if (!id) return

    try {
      setIsLoading(true)
      const response = await historicalMomentsApi.getById(id)
      
      if (response.data.success) {
        setMoment(response.data.data)
      } else {
        setError(t('historyDetailPage.historicalMomentNotFound'))
      }
    } catch (error: any) {
      console.error('Error fetching historical moment:', error)
      setError(error?.response?.data?.message || t('historyDetailPage.failedToLoad'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMoment()
  }, [id])

  const handleCopyLink = async () => {
    try {
      const url = window.location.href
      await navigator.clipboard.writeText(url)
      toast.success(t('common.linkCopied'), {
        duration: 3000,
        position: 'bottom-center',
      })
    } catch (error) {
      console.error('Failed to copy link:', error)
      toast.error(t('common.linkCopyFailed'), {
        duration: 3000,
        position: 'bottom-center',
      })
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: moment.title,
      text: moment.description,
      url: window.location.href,
    }

    try {
      // Check if Web Share API is supported
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData)
        toast.success(t('common.shareSuccessful'), {
          duration: 3000,
          position: 'bottom-center',
        })
      } else {
        // Fallback to copying link
        await handleCopyLink()
        toast(t('common.shareNotSupported'), {
          duration: 3000,
          position: 'bottom-center',
          icon: '📋',
        })
      }
    } catch (error: any) {
      // If user cancels the share, don't show error
      if (error.name !== 'AbortError') {
        console.error('Failed to share:', error)
        toast.error(t('common.shareFailed'), {
          duration: 3000,
          position: 'bottom-center',
        })
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !moment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {error || t('historyDetailPage.momentNotFound')}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {t('historyDetailPage.momentNotFoundDescription')}
          </p>
          <button
            onClick={() => navigate('/history')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            {t('common.backToHistory')}
          </button>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const locale = language === 'bn' ? 'bn-BD' : 'en-US'
    return new Date(dateString).toLocaleDateString(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const timeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 30) {
      return t('historyDetailPage.timeAgo.daysAgo', { count: diffDays })
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      if (months === 1) {
        return t('historyDetailPage.timeAgo.monthAgo', { count: months })
      } else {
        return t('historyDetailPage.timeAgo.monthsAgo', { count: months })
      }
    } else {
      const years = Math.floor(diffDays / 365)
      if (years === 1) {
        return t('historyDetailPage.timeAgo.yearAgo', { count: years })
      } else {
        return t('historyDetailPage.timeAgo.yearsAgo', { count: years })
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with Back Button */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/history')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{t('common.backToHistory')}</span>
            </button>
            
            {moment.isHighlighted && (
              <div className="flex items-center space-x-2 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 px-3 py-1 rounded-full">
                <Star className="w-4 h-4" />
                <span className="text-sm font-medium">{t('historyDetailPage.highlighted')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section with Media - Full Width */}
      <div className="relative w-full">
        <div className="relative w-full h-[60vh] min-h-[400px] max-h-[70vh] bg-gray-200 dark:bg-gray-800 overflow-hidden">
          {moment.mediaType === 'video' ? (
            <video
              src={moment.mediaUrl}
              controls
              className="absolute inset-0 w-full h-full object-cover object-center"
              poster={moment.thumbnailUrl}
            />
          ) : (
            <img
              src={moment.mediaUrl}
              alt={moment.title}
              className="absolute inset-0 w-full h-full object-cover object-center"
              style={{
                objectFit: 'cover',
                objectPosition: 'center center'
              }}
            />
          )}
        </div>
        
        {/* Overlay Content */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
                {moment.title}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 text-white/90">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm sm:text-base lg:text-lg">{formatDate(moment.date)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm sm:text-base">{timeAgo(moment.date)}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="prose prose-lg max-w-none dark:prose-invert"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {t('historyDetailPage.aboutThisMoment')}
              </h2>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                  {moment.description}
                </p>
              </div>
            </motion.div>

            {/* Tags Section */}
            {moment.tags && moment.tags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-8"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Hash className="w-5 h-5 mr-2" />
                  {t('historyDetailPage.tags')}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {moment.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium border border-blue-200 dark:border-blue-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="sticky top-24 space-y-6"
            >
              {/* Quick Info Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  {t('historyDetailPage.quickInfo')}
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('historyDetailPage.date')}</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatDate(moment.date)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <Camera className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('historyDetailPage.mediaType')}</p>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">
                        {t(`historyPage.${moment.mediaType}`)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('historyDetailPage.added')}</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatDate(moment.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Share Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  {t('historyDetailPage.shareThisMoment')}
                </h3>
                
                <div className="flex space-x-3">
                  <button 
                    onClick={handleCopyLink}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                  >
                    {t('common.copyLink')}
                  </button>
                  <button 
                    onClick={handleShare}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                  >
                    {t('common.share')}
                  </button>
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  {t('historyDetailPage.communityImpact')}
                </h3>
                
                <div className="flex items-center justify-center space-x-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {Math.floor(Math.random() * 500) + 100}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('historyDetailPage.views')}</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {Math.floor(Math.random() * 50) + 10}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('historyDetailPage.likes')}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HistoricalMomentDetailPage 