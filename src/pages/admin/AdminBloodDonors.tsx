import { BloodDonorSkeleton } from '@/components/UI/Skeleton'
import { bloodDonorsApi } from '@/services/api'
import { Edit, MapPin, Phone, Plus, Trash2, User, Users } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

interface BloodDonor {
  _id: string
  fullName: string
  email?: string
  phoneNumber: string
  bloodGroup: string
  gender?: string
  address: {
    city: string
    state: string
    street?: string
  }
  emergencyContact: {
    name: string
    relationship: string
    phoneNumber: string
  }
  lastDonationDate?: string
  totalDonations: number
  isAvailableForDonation: boolean
  status: string
  isVerified: boolean
  createdAt: string
}

interface BloodDonorForm {
  fullName: string
  email?: string
  phoneNumber: string
  bloodGroup: string
  gender?: string
  dateOfBirth?: string
  weight?: number
  height?: number
  address: {
    street?: string
    city: string
    state: string
    postalCode?: string
    country: string
  }
  emergencyContact: {
    name: string
    relationship: string
    phoneNumber: string
  }
  medicalHistory?: string[]
  allergies?: string[]
  medications?: string[]
  isEligibleToDonate: boolean
  notes?: string
  tags?: string[]
}

const AdminBloodDonors: React.FC = () => {
  const [donors, setDonors] = useState<BloodDonor[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingDonor, setEditingDonor] = useState<BloodDonor | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    bloodGroup: '',
    status: 'active',
    isAvailable: '',
    page: 1,
    limit: 20
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<BloodDonorForm>()

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  const genders = ['male', 'female', 'other']
  const statuses = ['active', 'inactive', 'suspended', 'deceased']

  const fetchDonors = async () => {
    try {
      setLoading(true)
      const params = {
        page: filters.page,
        limit: filters.limit,
        ...(filters.bloodGroup && { bloodGroup: filters.bloodGroup }),
        ...(filters.status !== 'active' && { status: filters.status }),
        ...(filters.isAvailable && { isAvailable: filters.isAvailable }),
        ...(searchTerm && { search: searchTerm })
      }

      const response = await bloodDonorsApi.getAll(params)
      
      if (response.data.success) {
        setDonors(response.data.data)
        setPagination(response.data.pagination)
      } else {
        toast.error('Failed to fetch donors')
      }
    } catch (error) {
      console.error('Error fetching donors:', error)
      toast.error('Failed to fetch donors')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDonors()
  }, [filters, searchTerm])

  const handleCreateOrUpdate = async (data: BloodDonorForm) => {
    try {
      const response = editingDonor 
        ? await bloodDonorsApi.update(editingDonor._id, data)
        : await bloodDonorsApi.create(data)

      if (response.data.success) {
        toast.success(editingDonor ? 'Donor updated successfully!' : 'Donor created successfully!')
        setShowModal(false)
        setEditingDonor(null)
        reset()
        fetchDonors()
      } else {
        toast.error(response.data.message || 'Failed to save donor')
      }
    } catch (error: any) {
      console.error('Error saving donor:', error)
      toast.error(error.response?.data?.message || 'Failed to save donor')
    }
  }

  const handleEdit = (donor: BloodDonor) => {
    setEditingDonor(donor)
    reset({
      fullName: donor.fullName,
      email: donor.email || '',
      phoneNumber: donor.phoneNumber,
      bloodGroup: donor.bloodGroup,
      gender: donor.gender || '',
      address: {
        street: donor.address.street || '',
        city: donor.address.city,
        state: donor.address.state,
        country: 'Bangladesh'
      },
      emergencyContact: {
        name: donor.emergencyContact.name,
        relationship: donor.emergencyContact.relationship,
        phoneNumber: donor.emergencyContact.phoneNumber
      },
      isEligibleToDonate: true,
      notes: '',
      tags: []
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this donor?')) return

    try {
      const response = await bloodDonorsApi.delete(id)

      if (response.data.success) {
        toast.success('Donor deleted successfully!')
        fetchDonors()
      } else {
        toast.error(response.data.message || 'Failed to delete donor')
      }
    } catch (error: any) {
      console.error('Error deleting donor:', error)
      toast.error(error.response?.data?.message || 'Failed to delete donor')
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
      case 'suspended': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
      case 'deceased': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
    }
  }

  const getAvailabilityStatus = (donor: BloodDonor) => {
    if (donor.isAvailableForDonation) {
      return {
        text: 'Available',
        className: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
      }
    } else {
      return {
        text: 'Not Available',
        className: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Blood Donors Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage blood donors and their information
          </p>
        </div>
        <button
          onClick={() => {
            setEditingDonor(null)
            reset()
            setShowModal(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New Donor
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <input
              type="text"
              placeholder="Search donors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <select
              value={filters.bloodGroup}
              onChange={(e) => handleFilterChange('bloodGroup', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Blood Groups</option>
              {bloodGroups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filters.isAvailable}
              onChange={(e) => handleFilterChange('isAvailable', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Availability</option>
              <option value="true">Available</option>
              <option value="false">Not Available</option>
            </select>
          </div>
        </div>
      </div>

      {/* Donors Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Total Donors: {pagination.totalItems}
          </h2>
        </div>

        {loading ? (
          <BloodDonorSkeleton />
        ) : donors.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No donors found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Donor Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Donations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {donors.map((donor) => {
                  const availability = getAvailabilityStatus(donor)
                  return (
                    <tr key={donor._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {donor.fullName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {donor.email || 'No email'}
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                              {donor.bloodGroup}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900 dark:text-white">
                          <Phone className="w-4 h-4 mr-2" />
                          {donor.phoneNumber}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Emergency: {donor.emergencyContact.phoneNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900 dark:text-white">
                          <MapPin className="w-4 h-4 mr-2" />
                          {donor.address.city}, {donor.address.state}
                        </div>
                        {donor.address.street && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {donor.address.street}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div>Total: {donor.totalDonations}</div>
                        {donor.lastDonationDate && (
                          <div className="text-gray-500 dark:text-gray-400">
                            Last: {new Date(donor.lastDonationDate).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(donor.status)}`}>
                            {donor.status.charAt(0).toUpperCase() + donor.status.slice(1)}
                          </span>
                          <br />
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${availability.className}`}>
                            {availability.text}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(donor)}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 flex items-center gap-1"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(donor._id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
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
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {editingDonor ? 'Edit Blood Donor' : 'Add New Blood Donor'}
              </h3>
            </div>

            <form onSubmit={handleSubmit(handleCreateOrUpdate)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    {...register('fullName', { required: 'Full name is required' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <input
                    {...register('phoneNumber', { required: 'Phone number is required' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  {errors.phoneNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Blood Group *
                  </label>
                  <select
                    {...register('bloodGroup', { required: 'Blood group is required' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Blood Group</option>
                    {bloodGroups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                  {errors.bloodGroup && (
                    <p className="text-red-500 text-sm mt-1">{errors.bloodGroup.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gender
                  </label>
                  <select
                    {...register('gender')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Gender</option>
                    {genders.map(gender => (
                      <option key={gender} value={gender}>{gender.charAt(0).toUpperCase() + gender.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date of Birth
                  </label>
                  <input
                    {...register('dateOfBirth')}
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    {...register('weight', { valueAsNumber: true })}
                    type="number"
                    min="30"
                    max="200"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Height (cm)
                  </label>
                  <input
                    {...register('height', { valueAsNumber: true })}
                    type="number"
                    min="100"
                    max="250"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="border-t pt-4">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Address Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Street Address
                    </label>
                    <input
                      {...register('address.street')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      City *
                    </label>
                    <input
                      {...register('address.city', { required: 'City is required' })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    {errors.address?.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.address.city.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      State *
                    </label>
                    <input
                      {...register('address.state', { required: 'State is required' })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    {errors.address?.state && (
                      <p className="text-red-500 text-sm mt-1">{errors.address.state.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Postal Code
                    </label>
                    <input
                      {...register('address.postalCode')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Country
                    </label>
                    <input
                      {...register('address.country')}
                      defaultValue="Bangladesh"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="border-t pt-4">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Emergency Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name *
                    </label>
                    <input
                      {...register('emergencyContact.name', { required: 'Emergency contact name is required' })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    {errors.emergencyContact?.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.emergencyContact.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Relationship *
                    </label>
                    <input
                      {...register('emergencyContact.relationship', { required: 'Relationship is required' })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    {errors.emergencyContact?.relationship && (
                      <p className="text-red-500 text-sm mt-1">{errors.emergencyContact.relationship.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number *
                    </label>
                    <input
                      {...register('emergencyContact.phoneNumber', { required: 'Emergency contact phone is required' })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    {errors.emergencyContact?.phoneNumber && (
                      <p className="text-red-500 text-sm mt-1">{errors.emergencyContact.phoneNumber.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="border-t pt-4">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Additional Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center">
                      <input
                        {...register('isEligibleToDonate')}
                        type="checkbox"
                        defaultChecked={true}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Eligible to Donate
                      </span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notes
                    </label>
                    <textarea
                      {...register('notes')}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : (editingDonor ? 'Update Donor' : 'Create Donor')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminBloodDonors

