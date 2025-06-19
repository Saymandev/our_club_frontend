import LoadingSpinner from '@/components/UI/LoadingSpinner'
import { announcementsApi } from '@/services/api'
import { useLanguageStore } from '@/store/languageStore'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, Share2, Tag, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'

const AnnouncementDetailPage = () => {
  const { id } = useParams()
  const { t } = useTranslation()
  const { language } = useLanguageStore()
  const [announcement, setAnnouncement] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const fetchAnnouncement = async () => {
      if (!id) return

      try {
        const response = await announcementsApi.getById(id)
        
        if (response.data.success) {
          setAnnouncement(response.data.data)
        } else {
          setError(response.data.message || t('announcementDetailPage.announcementNotFound'))
        }
      } catch (error: any) {
        setError(error?.response?.data?.message || t('announcementDetailPage.failedToLoad'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnnouncement()
  }, [id, t])

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
      title: announcement.title,
      text: announcement.content.substring(0, 200) + (announcement.content.length > 200 ? '...' : ''),
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const formatDate = (dateString: string) => {
    const locale = language === 'bn' ? 'bn-BD' : 'en-US'
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !announcement) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || t('announcementDetailPage.announcementNotFound')}
          </p>
          <Link to="/announcements" className="btn-primary">
            {t('common.backToAnnouncements')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <Link
            to="/announcements"
            className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.backToAnnouncements')}
          </Link>
        </motion.div>

        {/* Article */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="card p-8"
        >
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(announcement.priority)}`}>
                {t(`announcementsPage.priorities.${announcement.priority}`)}
              </span>
              
              {announcement.tags && announcement.tags.length > 0 && (
                <div className="flex items-center space-x-2">
                  {announcement.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <h1 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 dark:text-white mb-6">
              {announcement.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>{t('announcementDetailPage.byAuthor', { author: announcement.author })}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {t('announcementDetailPage.publishedOn', { date: formatDate(announcement.publishDate) })}
                </span>
              </div>

              {announcement.expiryDate && (
                <div className="flex items-center space-x-2">
                  <Tag className="w-4 h-4" />
                  <span>
                    {t('announcementDetailPage.expires', { date: formatDate(announcement.expiryDate) })}
                  </span>
                </div>
              )}
            </div>

            {/* Share Section */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <Share2 className="w-4 h-4" />
                <span>{t('announcementDetailPage.shareThisAnnouncement')}</span>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={handleCopyLink}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                  {t('common.copyLink')}
                </button>
                <button 
                  onClick={handleShare}
                  className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                  {t('common.share')}
                </button>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
              {announcement.content}
            </div>
          </div>

          {/* Attachments */}
          {announcement.attachments && announcement.attachments.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('announcementDetailPage.attachments')}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {announcement.attachments.map((attachment: any, index: number) => (
                  <a
                    key={index}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                        <Tag className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {attachment.filename}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {attachment.type}
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </motion.article>
      </div>
    </div>
  )
}

export default AnnouncementDetailPage 