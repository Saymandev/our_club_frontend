import LoadingSpinner from '@/components/UI/LoadingSpinner'
import { bloodDonationApi } from '@/services/api'
import { User } from '@/store/authStore'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

interface BloodDonor extends User {
  daysSinceLastDonation?: number | null
  isAvailableForDonation?: boolean
}

const BloodDonorsPage: React.FC = () => {
  const { t } = useTranslation()
  const [donors, setDonors] = useState<BloodDonor[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    bloodGroup: '',
    available: '',
    page: 1,
    limit: 20
  })
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    count: 0
  })
  const [emergencySearch, setEmergencySearch] = useState('')
  const [emergencyDonors, setEmergencyDonors] = useState<BloodDonor[]>([])
  const [emergencyLoading, setEmergencyLoading] = useState(false)

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  const fetchDonors = async () => {
    try {
      setLoading(true)
      
      const response = await bloodDonationApi.getAllDonors(filters)
      console.log('Donors response:', response.data)
      setDonors(response.data.data)
      setPagination(response.data.pagination)
    } catch (error: any) {
      console.error('Fetch donors error:', error)
      console.error('Error response:', error.response)
      console.error('Error message:', error.message)
      
      if (error.code === 'ERR_NETWORK') {
        toast.error(t('bloodDonation.networkError'))
      } else if (error.response?.status === 404) {
        toast.error(t('bloodDonation.endpointNotFound'))
      } else {
        toast.error(error.response?.data?.message || t('bloodDonation.checkConsole'))
      }
    } finally {
      setLoading(false)
    }
  }

  const searchEmergencyDonors = async () => {
    if (!emergencySearch) return
    
    try {
      setEmergencyLoading(true)
      const response = await bloodDonationApi.getAvailableDonorsByBloodGroup(emergencySearch)
      setEmergencyDonors(response.data.data)
      toast.success(t('bloodDonation.foundDonors', { count: response.data.count }))
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('bloodDonation.failedToFetch'))
    } finally {
      setEmergencyLoading(false)
    }
  }

  useEffect(() => {
    fetchDonors()
  }, [filters])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const getAvailabilityStatus = (donor: BloodDonor) => {
    if (donor.isAvailableForDonation) {
      return {
        text: t('bloodDonation.available'),
        className: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
      }
    } else {
      const days = donor.daysSinceLastDonation || 0
      const remainingDays = 120 - days
      return {
        text: t('bloodDonation.availableIn', { days: remainingDays }),
        className: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
      }
    }
  }

  const formatDaysAgo = (days: number | null) => {
    if (days === null) return t('bloodDonation.neverDonated')
    if (days === 0) return t('bloodDonation.today')
    if (days === 1) return t('bloodDonation.dayAgo')
    return t('bloodDonation.daysAgo', { days })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('bloodDonation.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('bloodDonation.description')}
          </p>
        </div>

        {/* Emergency Search Section */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-300 mb-4">
            {t('bloodDonation.emergencySearch')}
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={emergencySearch}
              onChange={(e) => setEmergencySearch(e.target.value)}
              className="flex-1 px-4 py-2 border border-red-300 dark:border-red-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">{t('bloodDonation.selectBloodGroup')}</option>
              {bloodGroups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
            <button
              onClick={searchEmergencyDonors}
              disabled={!emergencySearch || emergencyLoading}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {emergencyLoading ? t('bloodDonation.searching') : t('bloodDonation.findAvailableDonors')}
            </button>
          </div>
          
          {emergencyDonors.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium text-red-800 dark:text-red-300 mb-2">
                {t('bloodDonation.availableDonors')} ({emergencyDonors.length}):
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {emergencyDonors.map(donor => (
                  <div key={donor.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">{donor.username}</h4>
                      <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-sm rounded">
                        {donor.bloodGroup}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      📞 {donor.contactNumber}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('bloodDonation.lastDonation')}: {formatDaysAgo(donor.daysSinceLastDonation ?? null)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Filters Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('bloodDonation.filterDonors')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('bloodDonation.bloodGroup')}
              </label>
              <select
                value={filters.bloodGroup}
                onChange={(e) => handleFilterChange('bloodGroup', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">{t('bloodDonation.allBloodGroups')}</option>
                {bloodGroups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('bloodDonation.availability')}
              </label>
              <select
                value={filters.available}
                onChange={(e) => handleFilterChange('available', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">{t('bloodDonation.allDonors')}</option>
                <option value="true">{t('bloodDonation.availableNow')}</option>
                <option value="false">{t('bloodDonation.notAvailable')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('bloodDonation.resultsPerPage')}
              </label>
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        </div>

        {/* Donors List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('bloodDonation.title')} ({pagination.count} results)
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : donors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">{t('bloodDonation.noDonorsFound')}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {donors.map((donor) => {
                const status = getAvailabilityStatus(donor)
                return (
                  <div key={donor.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {donor.username}
                          </h3>
                          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium rounded-full">
                            {donor.bloodGroup}
                          </span>
                          <span className={`px-3 py-1 text-sm font-medium rounded-full ${status.className}`}>
                            {status.text}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span>📞 {donor.contactNumber}</span>
                          <span className="hidden sm:inline">•</span>
                          <span>{t('bloodDonation.lastDonation')}: {formatDaysAgo(donor.daysSinceLastDonation ?? null)}</span>
                          <span className="hidden sm:inline">•</span>
                          <span>{t('bloodDonation.memberSince')}: {new Date(donor.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination.total > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Page {pagination.current} of {pagination.total}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.current - 1)}
                    disabled={pagination.current === 1}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {t('common.previous')}
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.current + 1)}
                    disabled={pagination.current === pagination.total}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {t('common.next')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BloodDonorsPage 