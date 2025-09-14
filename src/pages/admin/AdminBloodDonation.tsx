import { BloodDonorSkeleton } from '@/components/UI/Skeleton'
import { authApi, bloodDonationApi } from '@/services/api'
import { User } from '@/store/authStore'
import { Edit, Plus, RotateCcw } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

interface BloodDonor extends User {
  daysSinceLastDonation?: number | null
  isAvailableForDonation?: boolean
}

const AdminBloodDonation: React.FC = () => {
  const { t } = useTranslation()
  const [donors, setDonors] = useState<BloodDonor[]>([])
  const [loading, setLoading] = useState(true)
  const [editingDonor, setEditingDonor] = useState<BloodDonor | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editForm, setEditForm] = useState({
    bloodGroup: '',
    contactNumber: '',
    lastDonationDate: ''
  })
  const [addForm, setAddForm] = useState({
    username: '',
    email: '',
    password: '',
    bloodGroup: '',
    contactNumber: '',
    lastDonationDate: ''
  })
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

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  const fetchDonors = async () => {
    try {
      setLoading(true)
      const response = await bloodDonationApi.getAllDonors(filters)
      setDonors(response.data.data)
      setPagination(response.data.pagination)
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('bloodDonation.failedToFetch'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDonors()
  }, [filters])

  const handleEditDonor = (donor: BloodDonor) => {
    setEditingDonor(donor)
    setEditForm({
      bloodGroup: donor.bloodGroup || '',
      contactNumber: donor.contactNumber || '',
      lastDonationDate: donor.lastDonationDate 
        ? new Date(donor.lastDonationDate).toISOString().split('T')[0] 
        : ''
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDonor) return

    try {
      await bloodDonationApi.adminUpdateBloodInfo(editingDonor.id, editForm)
      
      toast.success(t('bloodDonation.bloodInfoUpdated'))
      setEditingDonor(null)
      fetchDonors() // Refresh the list
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('bloodDonation.failedToUpdate'))
    }
  }

  const handleAddDonor = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Create a new user first, then update their blood info
      const userData = {
        username: addForm.username,
        email: addForm.email,
        password: addForm.password,
        role: 'user'
      }

      // Step 1: Create the user using axios
      const newUser = await authApi.register(userData)

      // Extract user ID from response
      const userId = newUser.data.user._id

      // Step 2: Update the user's blood donation info using axios
      const bloodData = {
        bloodGroup: addForm.bloodGroup,
        contactNumber: addForm.contactNumber,
        lastDonationDate: addForm.lastDonationDate || undefined
      }

      await bloodDonationApi.adminUpdateBloodInfo(userId, bloodData)

      toast.success('Blood donor created successfully!')
      setShowAddModal(false)
      setAddForm({
        username: '',
        email: '',
        password: '',
        bloodGroup: '',
        contactNumber: '',
        lastDonationDate: ''
      })
      fetchDonors() // Refresh the list
    } catch (error: any) {
      console.error('Error creating donor:', error)
      console.error('Add form data:', addForm)
      toast.error(error.response?.data?.message || error.message || 'Failed to create donor')
    }
  }

  const handleResetAvailability = async (donor: BloodDonor) => {
    if (!confirm(`Are you sure you want to reset donation availability for ${donor.username}? This will make them immediately available to donate.`)) {
      return
    }

    try {
      await bloodDonationApi.adminResetDonationAvailability(donor.id)
      toast.success('Donation availability reset successfully!')
      fetchDonors() // Refresh the list
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset availability')
    }
  }

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('bloodDonation.adminTitle')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('bloodDonation.adminDescription')}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New Donor
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('bloodDonation.filterDonors')}</h2>
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

      {/* Donors Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('bloodDonation.totalDonors')}: {pagination.count}
          </h2>
        </div>

        {loading ? (
          <BloodDonorSkeleton />
        ) : donors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">{t('bloodDonation.noDonorsFound')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('bloodDonation.donorInfo')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('bloodDonation.contact')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('bloodDonation.lastDonation')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('bloodDonation.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('bloodDonation.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {donors.map((donor) => {
                  const status = getAvailabilityStatus(donor)
                  return (
                    <tr key={donor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {donor.username}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {donor.email}
                            </div>
                          </div>
                          <span className="ml-3 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded">
                            {donor.bloodGroup}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {donor.contactNumber || t('bloodDonation.notProvided')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatDaysAgo(donor.daysSinceLastDonation ?? null)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${status.className}`}>
                          {status.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditDonor(donor)}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 flex items-center gap-1"
                          >
                            <Edit className="w-4 h-4" />
                            {t('bloodDonation.edit')}
                          </button>
                          {!donor.isAvailableForDonation && (
                            <button
                              onClick={() => handleResetAvailability(donor)}
                              className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 flex items-center gap-1"
                              title="Reset donation availability"
                            >
                              <RotateCcw className="w-4 h-4" />
                              Reset
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
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

      {/* Edit Modal */}
      {editingDonor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {t('bloodDonation.editBloodInfo')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{editingDonor.username}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('bloodDonation.bloodGroup')}
                </label>
                <select
                  value={editForm.bloodGroup}
                  onChange={(e) => setEditForm(prev => ({ ...prev, bloodGroup: e.target.value }))}
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
                  {t('bloodDonation.contactNumber')}
                </label>
                <input
                  type="tel"
                  value={editForm.contactNumber}
                  onChange={(e) => setEditForm(prev => ({ ...prev, contactNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={t('bloodDonation.enterContactNumber')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('bloodDonation.lastDonation')}
                </label>
                <input
                  type="date"
                  value={editForm.lastDonationDate}
                  onChange={(e) => setEditForm(prev => ({ ...prev, lastDonationDate: e.target.value }))}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingDonor(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  {t('bloodDonation.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  {t('bloodDonation.update')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Donor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Add New Blood Donor
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create a new donor profile
              </p>
            </div>

            <form onSubmit={handleAddDonor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  value={addForm.username}
                  onChange={(e) => setAddForm(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={addForm.password}
                  onChange={(e) => setAddForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter password"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Blood Group *
                </label>
                <select
                  value={addForm.bloodGroup}
                  onChange={(e) => setAddForm(prev => ({ ...prev, bloodGroup: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select Blood Group</option>
                  {bloodGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contact Number *
                </label>
                <input
                  type="tel"
                  value={addForm.contactNumber}
                  onChange={(e) => setAddForm(prev => ({ ...prev, contactNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter contact number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Donation Date
                </label>
                <input
                  type="date"
                  value={addForm.lastDonationDate}
                  onChange={(e) => setAddForm(prev => ({ ...prev, lastDonationDate: e.target.value }))}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Add Donor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminBloodDonation 