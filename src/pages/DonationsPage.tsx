import { donationApi } from '@/services/api'
import { motion } from 'framer-motion'
import { Copy, Heart, Phone, Smartphone } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

interface DonationSettings {
  mobileBanking: {
    bkash: {
      enabled: boolean;
      number: string;
      type: string;
      instructions: string;
    };
    nagad: {
      enabled: boolean;
      number: string;
      type: string;
      instructions: string;
    };
    rocket: {
      enabled: boolean;
      number: string;
      type: string;
      instructions: string;
    };
    upay: {
      enabled: boolean;
      number: string;
      type: string;
      instructions: string;
    };
  };
  bankAccount: {
    enabled: boolean;
    bankName: string;
    accountName: string;
    accountNumber: string;
    routingNumber: string;
    branch: string;
  };
  general: {
    title: {
      en: string;
      bn: string;
    };
    description: {
      en: string;
      bn: string;
    };
    contactEmail: string;
    contactPhone: string;
  };
}

const DonationsPage = () => {
  const { t, i18n } = useTranslation()
  const [copiedText, setCopiedText] = useState('')
  const [settings, setSettings] = useState<DonationSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDonationSettings()
  }, [])

  const fetchDonationSettings = async () => {
    try {
      setLoading(true)
      const response = await donationApi.getSettings()
      setSettings(response.data.data)
    } catch (error) {
      console.error('Failed to fetch donation settings:', error)
      toast.error('Failed to load donation information')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(type)
      toast.success(t('donations.copied'))
      setTimeout(() => setCopiedText(''), 2000)
    } catch (error) {
      toast.error(t('donations.copyFailed'))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Error</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Failed to load donation information</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const currentLang = i18n.language as 'en' | 'bn'
  
  const enabledMobileBanking = Object.entries(settings.mobileBanking)
    .filter(([key, service]) => service.enabled)
    .map(([key, service]) => ({
      name: key === 'bkash' ? 'bKash' : key.charAt(0).toUpperCase() + key.slice(1),
      icon: key === 'bkash' ? '💳' : key === 'nagad' ? '📱' : key === 'rocket' ? '🚀' : '💰',
      color: key === 'bkash' ? 'bg-pink-500' : key === 'nagad' ? 'bg-orange-500' : key === 'rocket' ? 'bg-purple-500' : 'bg-blue-500',
      number: service.number,
      type: service.type,
      instructions: service.instructions
    }))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/"
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors mb-6"
        >
          <span>←</span>
          <span>{t('common.backToWebsite')}</span>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-heading font-bold text-gray-900 dark:text-white mb-4">
            {settings.general.title[currentLang]}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {settings.general.description[currentLang]}
          </p>
        </motion.div>

        {/* Mobile Banking Section */}
        {enabledMobileBanking.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
              <Smartphone className="w-6 h-6 mr-2" />
              {t('donations.mobileBanking')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('donations.mobileBankingDescription')}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enabledMobileBanking.map((service, index) => (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 ${service.color} rounded-lg flex items-center justify-center text-white text-xl mr-4`}>
                      {service.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {service.name}
                      </h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {service.type}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                        <span className="font-mono text-gray-900 dark:text-white">
                          {service.number}
                        </span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(service.number, service.name)}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        <span className="text-sm">
                          {copiedText === service.name ? t('donations.copied') : t('donations.copy')}
                        </span>
                      </button>
                    </div>

                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {service.instructions}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Bank Account Section */}
        {settings.bankAccount.enabled && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
              🏦 {t('donations.bankAccount')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('donations.bankAccountDescription')}
            </p>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {t('donations.bankName')}
                    </label>
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <span className="text-gray-900 dark:text-white font-medium">
                        {settings.bankAccount.bankName}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {t('donations.accountName')}
                    </label>
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <span className="text-gray-900 dark:text-white font-medium">
                        {settings.bankAccount.accountName}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {t('donations.branch')}
                    </label>
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <span className="text-gray-900 dark:text-white font-medium">
                        {settings.bankAccount.branch}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {t('donations.accountNumber')}
                    </label>
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <span className="font-mono text-gray-900 dark:text-white">
                        {settings.bankAccount.accountNumber}
                      </span>
                      <button
                        onClick={() => copyToClipboard(settings.bankAccount.accountNumber, 'account')}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        <span className="text-sm">
                          {copiedText === 'account' ? t('donations.copied') : t('donations.copy')}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {t('donations.routingNumber')}
                    </label>
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <span className="font-mono text-gray-900 dark:text-white">
                        {settings.bankAccount.routingNumber}
                      </span>
                      <button
                        onClick={() => copyToClipboard(settings.bankAccount.routingNumber, 'routing')}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        <span className="text-sm">
                          {copiedText === 'routing' ? t('donations.copied') : t('donations.copy')}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Thank You Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-8"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('donations.thankYou')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('donations.thankYouMessage')}
          </p>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-600 dark:text-gray-400">
            {t('donations.questions')} {' '}
            <a 
              href={`mailto:${settings.general.contactEmail}`} 
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {settings.general.contactEmail}
            </a>
            {' '} {t('donations.or')} {' '}
            <a 
              href={`tel:+880${settings.general.contactPhone}`} 
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {settings.general.contactPhone}
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default DonationsPage 