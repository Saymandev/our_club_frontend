import LoadingSpinner from '@/components/UI/LoadingSpinner'
import { bloodDonationApi } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

interface BloodInfo {
  bloodGroup: string
  contactNumber: string
  lastDonationDate?: string
  daysSinceLastDonation?: number | null
  isAvailableForDonation?: boolean
}

const MyBloodDonationPage: React.FC = () => {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [bloodInfo, setBloodInfo] = useState<BloodInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [recordingDonation, setRecordingDonation] = useState(false)
  const [showUpdateForm, setShowUpdateForm] = useState(false)
  const [showRecordForm, setShowRecordForm] = useState(false)
  const [formData, setFormData] = useState({
    bloodGroup: '',
    contactNumber: ''
  })
  const [donationDate, setDonationDate] = useState('')

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  const fetchBloodInfo = async () => {
    try {
      setLoading(true)
      const response = await bloodDonationApi.getMyBloodInfo()
      setBloodInfo(response.data.data)
      setFormData({
        bloodGroup: response.data.data.bloodGroup || '',
        contactNumber: response.data.data.contactNumber || ''
      })
    } catch (error: any) {
      console.error('Error fetching blood info:', error)
      // Don't show error for 404, just show empty state
      if (error.response?.status !== 404) {
        toast.error(error.response?.data?.message || t('bloodDonation.failedToFetch'))
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchBloodInfo()
    }
  }, [user])

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setUpdating(true)
      const updateData = {
        bloodGroup: formData.bloodGroup,
        contactNumber: formData.contactNumber
      }
      
      await bloodDonationApi.updateBloodInfo(updateData)
      
      toast.success(t('bloodDonation.bloodInfoUpdated'))
      setShowUpdateForm(false)
      fetchBloodInfo() // Refresh data
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('bloodDonation.failedToUpdate'))
    } finally {
      setUpdating(false)
    }
  }

  const handleRecordDonation = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setRecordingDonation(true)
      
      await bloodDonationApi.recordDonation({
        donationDate: donationDate || undefined
      })
      
      toast.success(t('bloodDonation.donationRecorded'))
      setShowRecordForm(false)
      setDonationDate('')
      fetchBloodInfo() // Refresh data
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('bloodDonation.failedToRecord'))
    } finally {
      setRecordingDonation(false)
    }
  }

  const formatDaysAgo = (days: number | null) => {
    if (days === null) return t('bloodDonation.neverDonated')
    if (days === 0) return t('bloodDonation.today')
    if (days === 1) return t('bloodDonation.dayAgo')
    return t('bloodDonation.daysAgo', { days })
  }

  const getAvailabilityMessage = () => {
    if (!bloodInfo?.isAvailableForDonation) {
      const days = bloodInfo?.daysSinceLastDonation || 0
      const remainingDays = 90 - days
      return {
        message: t('bloodDonation.eligibleIn', { days: remainingDays }),
        className: 'text-red-600 bg-red-50',
        icon: '⏳'
      }
    }
    
    return {
      message: t('bloodDonation.eligibleNow'),
      className: 'text-green-600 bg-green-50',
      icon: '✅'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const availability = getAvailabilityMessage()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('bloodDonation.myBloodProfile')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('bloodDonation.profileDescription')}
          </p>
        </div>

        {/* Blood Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('bloodDonation.yourBloodInfo')}</h2>
            <button
              onClick={() => setShowUpdateForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {t('bloodDonation.updateInfo')}
            </button>
          </div>

          {bloodInfo ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    {t('bloodDonation.bloodGroup')}
                  </label>
                  <div className="text-2xl font-bold text-red-600">
                    {bloodInfo.bloodGroup || t('bloodDonation.notSet')}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    {t('bloodDonation.contactNumber')}
                  </label>
                  <div className="text-lg text-gray-900 dark:text-white">
                    {bloodInfo.contactNumber || t('bloodDonation.notProvided')}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    {t('bloodDonation.lastDonation')}
                  </label>
                  <div className="text-lg text-gray-900 dark:text-white">
                    {formatDaysAgo(bloodInfo.daysSinceLastDonation ?? null)}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className={`p-6 rounded-lg border-2 ${availability.className.includes('green') ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{availability.icon}</span>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('bloodDonation.donationEligibility')}</h3>
                  </div>
                  <p className={`text-sm ${availability.className.replace('bg-', 'text-').replace('-50', '-600')}`}>
                    {availability.message}
                  </p>
                </div>

                {bloodInfo.isAvailableForDonation && (
                  <button
                    onClick={() => setShowRecordForm(true)}
                    className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                  >
                    {t('bloodDonation.recordNewDonation')}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🩸</div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                {t('bloodDonation.noBloodInfo')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('bloodDonation.setupProfile')}
              </p>
              <button
                onClick={() => setShowUpdateForm(true)}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                {t('bloodDonation.setupButton')}
              </button>
            </div>
          )}
        </div>

        {/* Information Card */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">
            {t('bloodDonation.didYouKnow')}
          </h3>
          <ul className="text-blue-700 dark:text-blue-300 space-y-2">
            <li>{t('bloodDonation.facts.frequency')}</li>
            <li>{t('bloodDonation.facts.impact')}</li>
            <li>{t('bloodDonation.facts.duration')}</li>
            <li>{t('bloodDonation.facts.recovery')}</li>
          </ul>
        </div>

        {/* Update Info Modal */}
        {showUpdateForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {t('bloodDonation.updateBloodInfo')}
                </h3>
              </div>

              <form onSubmit={handleUpdateInfo} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('bloodDonation.bloodGroupRequired')}
                  </label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData(prev => ({ ...prev, bloodGroup: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">{t('bloodDonation.selectYourBloodGroup')}</option>
                    {bloodGroups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('bloodDonation.contactNumberRequired')}
                  </label>
                  <input
                    type="tel"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={t('bloodDonation.enterContactNumber')}
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUpdateForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    {t('bloodDonation.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {updating ? t('bloodDonation.updating') : t('bloodDonation.update')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Record Donation Modal */}
        {showRecordForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {t('bloodDonation.recordDonation')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t('bloodDonation.thankYouMessage')}
                </p>
              </div>

              <form onSubmit={handleRecordDonation} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('bloodDonation.donationDate')}
                  </label>
                  <input
                    type="date"
                    value={donationDate}
                    onChange={(e) => setDonationDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t('bloodDonation.leaveEmptyForToday')}
                  </p>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRecordForm(false)
                      setDonationDate('')
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    {t('bloodDonation.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={recordingDonation}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {recordingDonation ? t('bloodDonation.recording') : t('bloodDonation.recordDonationButton')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyBloodDonationPage 