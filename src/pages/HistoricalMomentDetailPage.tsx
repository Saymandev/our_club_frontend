import LoadingSpinner from '@/components/UI/LoadingSpinner'
import { historicalMomentsApi } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { useLanguageStore } from '@/store/languageStore'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Calendar, Camera, ChevronLeft, ChevronRight, Clock, Eye, Grid, Hash, Heart, Play, Star, Users, X, ZoomIn } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

interface MediaFile {
  mediaType: 'image' | 'video'
  mediaUrl: string
  thumbnailUrl?: string
}

const HistoricalMomentDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { language } = useLanguageStore()
  const {  isAuthenticated } = useAuthStore()
  const [moment, setMoment] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [likeData, setLikeData] = useState({ isLiked: false, likes: 0, views: 0 })
  const [isLiking, setIsLiking] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const fetchMoment = async () => {
    if (!id) return

    try {
      setIsLoading(true)
      const response = await historicalMomentsApi.getById(id)
      
      if (response.data.success) {
        const momentData = response.data.data
        setMoment(momentData)
        // If user is authenticated, get like status
        if (isAuthenticated) {
          try {
            const likeResponse = await historicalMomentsApi.getLikeStatus(id)
            if (likeResponse.data.success) {
              setLikeData(likeResponse.data.data)
            }
          } catch (likeError) {
            // If like status fails, just use the moment data
            setLikeData({
              isLiked: false,
              likes: response.data.data.likes || 0,
              views: response.data.data.views || 0
            })
          }
        } else {
          // For non-authenticated users, just show the counts
          setLikeData({
            isLiked: false,
            likes: response.data.data.likes || 0,
            views: response.data.data.views || 0
          })
        }
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

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error(t('common.loginRequired'), {
        duration: 3000,
        position: 'bottom-center',
      })
      return
    }

    if (!id || isLiking) return

    try {
      setIsLiking(true)
      const response = await historicalMomentsApi.toggleLike(id)
      
      if (response.data.success) {
        setLikeData(prev => ({
          ...prev,
          likes: response.data.data.likes,
          isLiked: response.data.data.isLiked
        }))
        
        toast.success(
          response.data.data.isLiked 
            ? t('historyDetailPage.likedSuccess') 
            : t('historyDetailPage.unlikedSuccess'),
          {
            duration: 2000,
            position: 'bottom-center',
          }
        )
      }
    } catch (error: any) {
      console.error('Error toggling like:', error)
      toast.error(error?.response?.data?.message || t('historyDetailPage.likeFailed'), {
        duration: 3000,
        position: 'bottom-center',
      })
    } finally {
      setIsLiking(false)
    }
  }

  useEffect(() => {
    fetchMoment()
  }, [id, isAuthenticated])

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

  // Get all media files (main + additional)
  const getAllMediaFiles = (): MediaFile[] => {
    if (!moment) return []
    
    const allFiles: MediaFile[] = []
    
    // Add main media file
    const mainFile = {
      mediaType: moment.mediaType,
      mediaUrl: moment.mediaUrl,
      thumbnailUrl: moment.thumbnailUrl
    }
    allFiles.push(mainFile)
    
    // Add additional media files
    if (moment.mediaFiles && moment.mediaFiles.length > 0) {
      allFiles.push(...moment.mediaFiles)
    }
    
    return allFiles
  }

  const mediaFiles = getAllMediaFiles()

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === mediaFiles.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? mediaFiles.length - 1 : prev - 1
    )
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setShowLightbox(true)
  }

  const closeLightbox = () => {
    setShowLightbox(false)
  }

  const nextInLightbox = () => {
    setLightboxIndex((prev) => 
      prev === mediaFiles.length - 1 ? 0 : prev + 1
    )
  }

  const prevInLightbox = () => {
    setLightboxIndex((prev) => 
      prev === 0 ? mediaFiles.length - 1 : prev - 1
    )
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

      {/* Hero Section with Main Media */}
      <div className="relative w-full">
        <div className="relative w-full h-[60vh] min-h-[400px] max-h-[70vh] bg-gray-200 dark:bg-gray-800 overflow-hidden">
          {mediaFiles.length > 0 && (
            <>
              {mediaFiles[currentImageIndex].mediaType === 'video' ? (
                <video
                  src={mediaFiles[currentImageIndex].mediaUrl}
                  controls
                  className="absolute inset-0 w-full h-full object-cover object-center z-10 cursor-pointer"
                  poster={mediaFiles[currentImageIndex].thumbnailUrl}
                  preload="metadata"
                  playsInline
                  style={{ pointerEvents: 'auto' }}
                  onError={(e) => {
                    console.error('Video failed to load:', e)
                    console.log('Video URL:', mediaFiles[currentImageIndex].mediaUrl)
                    console.log('Thumbnail URL:', mediaFiles[currentImageIndex].thumbnailUrl)
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    // Let the video handle its own click events
                  }}
                />
              ) : (
                <img
                  src={mediaFiles[currentImageIndex].mediaUrl}
                  alt={moment.title}
                  className="absolute inset-0 w-full h-full object-cover object-center cursor-pointer"
                  style={{
                    objectFit: 'cover',
                    objectPosition: 'center center'
                  }}
                  onClick={() => openLightbox(currentImageIndex)}
                />
              )}
              
              {/* Navigation arrows for multiple images */}
              {mediaFiles.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors backdrop-blur-sm z-20"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors backdrop-blur-sm z-20"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Zoom button for images */}
              {mediaFiles[currentImageIndex].mediaType === 'image' && (
                <button
                  onClick={() => openLightbox(currentImageIndex)}
                  className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors backdrop-blur-sm z-20"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
              )}
            </>
          )}
        </div>
        
        {/* Overlay Content */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8 pointer-events-none">
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
                {mediaFiles.length > 1 && (
                  <div className="flex items-center space-x-2">
                    <Grid className="w-5 h-5" />
                    <span className="text-sm sm:text-base">{mediaFiles.length} media files</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Media Thumbnails Gallery */}
      {mediaFiles.length > 1 && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Grid className="w-5 h-5 mr-2" />
              Media Gallery ({mediaFiles.length} files)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {mediaFiles.map((file, index) => (
                <div
                  key={index}
                  className={`relative group cursor-pointer rounded-lg overflow-hidden ${
                    index === currentImageIndex ? 'ring-4 ring-blue-500' : ''
                  }`}
                  onClick={() => {
                    setCurrentImageIndex(index)
                    if (file.mediaType === 'image') {
                      openLightbox(index)
                    }
                  }}
                >
                  <div className="aspect-square bg-gray-200 dark:bg-gray-700">
                    {file.mediaType === 'video' ? (
                      <div className="relative w-full h-full">
                        <img
                          src={file.thumbnailUrl || file.mediaUrl}
                          alt={`Media ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <Play className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    ) : (
                      <img
                        src={file.mediaUrl}
                        alt={`Media ${index + 1}`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    {file.mediaType === 'image' && (
                      <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Main
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
                        {mediaFiles.length > 1 ? `${mediaFiles.length} media files` : t(`historyPage.${moment.mediaType}`)}
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

              {/* Like Button Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t('historyDetailPage.engagement')}
                  </h3>
                  <button
                    onClick={handleLike}
                    disabled={isLiking || !isAuthenticated}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      likeData.isLiked
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                    } ${isLiking ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${
                      !isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${likeData.isLiked ? 'fill-current' : ''}`} />
                    <span>{likeData.isLiked ? t('historyDetailPage.liked') : t('historyDetailPage.like')}</span>
                  </button>
                </div>
                
                <div className="flex items-center justify-center space-x-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {likeData.views}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('historyDetailPage.views')}</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {likeData.likes}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('historyDetailPage.likes')}</p>
                  </div>
                </div>
                
                {!isAuthenticated && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
                    {t('historyDetailPage.loginToLike')}
                  </p>
                )}
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
            </motion.div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {showLightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
            onClick={closeLightbox}
          >
            <div className="relative w-full h-full flex items-center justify-center p-4">
              {/* Close button */}
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
              >
                <X className="w-8 h-8" />
              </button>

              {/* Navigation buttons */}
              {mediaFiles.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      prevInLightbox()
                    }}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
                  >
                    <ChevronLeft className="w-12 h-12" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      nextInLightbox()
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
                  >
                    <ChevronRight className="w-12 h-12" />
                  </button>
                </>
              )}

              {/* Image counter */}
              {mediaFiles.length > 1 && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-lg">
                  {lightboxIndex + 1} / {mediaFiles.length}
                </div>
              )}

              {/* Main image */}
              <motion.img
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                src={mediaFiles[lightboxIndex]?.mediaUrl}
                alt={`Media ${lightboxIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default HistoricalMomentDetailPage 