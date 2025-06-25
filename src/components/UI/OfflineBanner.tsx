import { AnimatePresence, motion } from 'framer-motion'
import { Wifi, WifiOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useOffline } from '../../hooks/useOffline'

export const OfflineBanner = () => {
  const isOffline = useOffline()
  const { t } = useTranslation()
  const [showBackOnline, setShowBackOnline] = useState(false)

  useEffect(() => {
    if (!isOffline && showBackOnline) {
      // Show back online message for 3 seconds
      const timer = setTimeout(() => {
        setShowBackOnline(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isOffline, showBackOnline])

  useEffect(() => {
    if (!isOffline && !showBackOnline) {
      // When going from offline to online, show the back online message
      const wasOffline = localStorage.getItem('wasOffline')
      if (wasOffline === 'true') {
        setShowBackOnline(true)
        localStorage.removeItem('wasOffline')
      }
    } else if (isOffline) {
      // Mark that user was offline
      localStorage.setItem('wasOffline', 'true')
    }
  }, [isOffline, showBackOnline])

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white px-4 py-2 text-center text-sm font-medium shadow-lg"
        >
          <div className="flex items-center justify-center gap-2">
            <WifiOff size={16} />
            <span>
              {t('offline.message', 'You are offline. Showing cached content.')}
            </span>
          </div>
        </motion.div>
      )}
      {showBackOnline && !isOffline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-50 bg-green-500 text-white px-4 py-2 text-center text-sm font-medium shadow-lg"
        >
          <div className="flex items-center justify-center gap-2">
            <Wifi size={16} />
            <span>
              {t('offline.backOnline', 'Back online!')}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 