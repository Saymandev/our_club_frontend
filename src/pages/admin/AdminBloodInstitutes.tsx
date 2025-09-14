import { BloodDonorSkeleton } from '@/components/UI/Skeleton'
import { bloodInstitutesApi } from '@/services/api'
import { Building2, Edit, Globe, MapPin, Phone, Plus, Trash2, Verified } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

interface BloodInstitute {
  _id: string
  name: string
  type: string
  description?: string
  phoneNumbers: string[]
  email?: string
  website?: string
  address: {
    street: string
    city: string
    state: string
    postalCode?: string
    country: string
  }
  contactPerson: {
    name: string
    title: string
    phoneNumber: string
    email?: string
  }
  services: {
    bloodCollection: boolean
    bloodTesting: boolean
    bloodStorage: boolean
    emergencyServices: boolean
    mobileBloodDrive: boolean
    apheresis: boolean
  }
  operatingHours: {
    monday: { open: string; close: string; isClosed: boolean }
    tuesday: { open: string; close: string; isClosed: boolean }
    wednesday: { open: string; close: string; isClosed: boolean }
    thursday: { open: string; close: string; isClosed: boolean }
    friday: { open: string; close: string; isClosed: boolean }
    saturday: { open: string; close: string; isClosed: boolean }
    sunday: { open: string; close: string; isClosed: boolean }
  }
  status: string
  isVerified: boolean
  createdAt: string
}

interface BloodInstituteForm {
  name: string
  type: string
  description?: string
  phoneNumbers: string[]
  email?: string
  website?: string
  address: {
    street: string
    city: string
    state: string
    postalCode?: string
    country: string
  }
  contactPerson: {
    name: string
    title: string
    phoneNumber: string
    email?: string
  }
  services: {
    bloodCollection: boolean
    bloodTesting: boolean
    bloodStorage: boolean
    emergencyServices: boolean
    mobileBloodDrive: boolean
    apheresis: boolean
  }
  operatingHours: {
    monday: { open: string; close: string; isClosed: boolean }
    tuesday: { open: string; close: string; isClosed: boolean }
    wednesday: { open: string; close: string; isClosed: boolean }
    thursday: { open: string; close: string; isClosed: boolean }
    friday: { open: string; close: string; isClosed: boolean }
    saturday: { open: string; close: string; isClosed: boolean }
    sunday: { open: string; close: string; isClosed: boolean }
  }
  capacity: {
    dailyCollectionCapacity?: number
    storageCapacity?: number
  }
  equipment: {
    bloodCollectionChairs?: number
    refrigeratedStorage: boolean
    freezers: boolean
    testingEquipment: boolean
    backupPower: boolean
    wifi: boolean
    parking: boolean
    wheelchairAccessible: boolean
  }
  donorRequirements: {
    minimumAge?: number
    maximumAge?: number
    minimumWeight?: number
    medicalScreeningRequired: boolean
    appointmentRequired: boolean
    walkInsAccepted: boolean
  }
  incentives: {
    providesCertificate: boolean
    providesSnacks: boolean
    providesTransportation: boolean
    providesMonetaryIncentive: boolean
    incentiveAmount?: number
  }
}

const AdminBloodInstitutes: React.FC = () => {
  const [institutes, setInstitutes] = useState<BloodInstitute[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingInstitute, setEditingInstitute] = useState<BloodInstitute | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    type: '',
    status: 'active',
    hasEmergencyServices: '',
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
  } = useForm<BloodInstituteForm>()

  const instituteTypes = ['hospital', 'clinic', 'blood_bank', 'medical_center', 'red_cross', 'other']
  const statuses = ['active', 'inactive', 'temporarily_closed', 'under_construction']
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

  const fetchInstitutes = async () => {
    try {
      setLoading(true)
      const params = {
        page: filters.page,
        limit: filters.limit,
        ...(filters.type && { type: filters.type }),
        ...(filters.status !== 'active' && { status: filters.status }),
        ...(filters.hasEmergencyServices && { hasEmergencyServices: filters.hasEmergencyServices }),
        ...(searchTerm && { search: searchTerm })
      }

      const response = await bloodInstitutesApi.getAll(params)
      
      if (response.data.success) {
        setInstitutes(response.data.data)
        setPagination(response.data.pagination)
      } else {
        toast.error('Failed to fetch institutes')
      }
    } catch (error) {
      console.error('Error fetching institutes:', error)
      toast.error('Failed to fetch institutes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInstitutes()
  }, [filters, searchTerm])

  const handleCreateOrUpdate = async (data: BloodInstituteForm) => {
    try {
      const response = editingInstitute 
        ? await bloodInstitutesApi.update(editingInstitute._id, data)
        : await bloodInstitutesApi.create(data)

      if (response.data.success) {
        toast.success(editingInstitute ? 'Institute updated successfully!' : 'Institute created successfully!')
        setShowModal(false)
        setEditingInstitute(null)
        reset()
        fetchInstitutes()
      } else {
        toast.error(response.data.message || 'Failed to save institute')
      }
    } catch (error: any) {
      console.error('Error saving institute:', error)
      toast.error(error.response?.data?.message || 'Failed to save institute')
    }
  }

  const handleEdit = (institute: BloodInstitute) => {
    setEditingInstitute(institute)
    reset({
      name: institute.name,
      type: institute.type,
      description: institute.description || '',
      phoneNumbers: institute.phoneNumbers,
      email: institute.email || '',
      website: institute.website || '',
      address: {
        street: institute.address.street,
        city: institute.address.city,
        state: institute.address.state,
        postalCode: institute.address.postalCode || '',
        country: institute.address.country
      },
      contactPerson: {
        name: institute.contactPerson.name,
        title: institute.contactPerson.title,
        phoneNumber: institute.contactPerson.phoneNumber,
        email: institute.contactPerson.email || ''
      },
      services: institute.services,
      operatingHours: institute.operatingHours,
      capacity: {
        dailyCollectionCapacity: 50,
        storageCapacity: 1000
      },
      equipment: {
        bloodCollectionChairs: 5,
        refrigeratedStorage: true,
        freezers: true,
        testingEquipment: false,
        backupPower: false,
        wifi: false,
        parking: true,
        wheelchairAccessible: false
      },
      donorRequirements: {
        minimumAge: 18,
        maximumAge: 65,
        minimumWeight: 50,
        medicalScreeningRequired: true,
        appointmentRequired: false,
        walkInsAccepted: true
      },
      incentives: {
        providesCertificate: true,
        providesSnacks: true,
        providesTransportation: false,
        providesMonetaryIncentive: false,
        incentiveAmount: 0
      }
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this institute?')) return

    try {
      const response = await bloodInstitutesApi.delete(id)

      if (response.data.success) {
        toast.success('Institute deleted successfully!')
        fetchInstitutes()
      } else {
        toast.error(response.data.message || 'Failed to delete institute')
      }
    } catch (error: any) {
      console.error('Error deleting institute:', error)
      toast.error(error.response?.data?.message || 'Failed to delete institute')
    }
  }

  const handleVerify = async (id: string, isVerified: boolean) => {
    try {
      const response = await bloodInstitutesApi.verify(id, isVerified)

      if (response.data.success) {
        toast.success(`Institute ${isVerified ? 'verified' : 'unverified'} successfully!`)
        fetchInstitutes()
      } else {
        toast.error(response.data.message || 'Failed to update verification status')
      }
    } catch (error: any) {
      console.error('Error updating verification:', error)
      toast.error(error.response?.data?.message || 'Failed to update verification status')
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
      case 'temporarily_closed': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
      case 'under_construction': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'hospital': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
      case 'clinic': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
      case 'blood_bank': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200'
      case 'medical_center': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
      case 'red_cross': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
    }
  }

  const formatPhoneNumbers = (phoneNumbers: string[]): string => {
    return phoneNumbers.join(', ')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Blood Institutes Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage blood institutes, hospitals, and clinics
          </p>
        </div>
        <button
          onClick={() => {
            setEditingInstitute(null)
            reset()
            setShowModal(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New Institute
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <input
              type="text"
              placeholder="Search institutes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Types</option>
              {instituteTypes.map(type => (
                <option key={type} value={type}>
                  {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
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
                <option key={status} value={status}>
                  {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filters.hasEmergencyServices}
              onChange={(e) => handleFilterChange('hasEmergencyServices', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Services</option>
              <option value="true">Emergency Services</option>
            </select>
          </div>
        </div>
      </div>

      {/* Institutes Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Total Institutes: {pagination.totalItems}
          </h2>
        </div>

        {loading ? (
          <BloodDonorSkeleton />
        ) : institutes.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No institutes found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Institute Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Services
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
                {institutes.map((institute) => (
                  <tr key={institute._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {institute.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {institute.description || 'No description'}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(institute.type)}`}>
                              {institute.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                            {institute.isVerified && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                                <Verified className="w-3 h-3 mr-1" />
                                Verified
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900 dark:text-white">
                        <Phone className="w-4 h-4 mr-2" />
                        {formatPhoneNumbers(institute.phoneNumbers)}
                      </div>
                      {institute.email && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {institute.email}
                        </div>
                      )}
                      {institute.website && (
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <Globe className="w-4 h-4 mr-1" />
                          {institute.website}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900 dark:text-white">
                        <MapPin className="w-4 h-4 mr-2" />
                        {institute.address.city}, {institute.address.state}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {institute.address.street}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {institute.services.bloodCollection && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                            Blood Collection
                          </span>
                        )}
                        {institute.services.emergencyServices && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200">
                            Emergency
                          </span>
                        )}
                        {institute.services.mobileBloodDrive && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                            Mobile Drive
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(institute.status)}`}>
                        {institute.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(institute)}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 flex items-center gap-1"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleVerify(institute._id, !institute.isVerified)}
                          className={`flex items-center gap-1 ${
                            institute.isVerified 
                              ? 'text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300'
                              : 'text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300'
                          }`}
                        >
                          <Verified className="w-4 h-4" />
                          {institute.isVerified ? 'Unverify' : 'Verify'}
                        </button>
                        <button
                          onClick={() => handleDelete(institute._id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
          <div className="relative top-5 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {editingInstitute ? 'Edit Blood Institute' : 'Add New Blood Institute'}
              </h3>
            </div>

            <form onSubmit={handleSubmit(handleCreateOrUpdate)} className="space-y-6">
              {/* Basic Information */}
              <div className="border-b pb-6">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Institute Name *
                    </label>
                    <input
                      {...register('name', { required: 'Institute name is required' })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type *
                    </label>
                    <select
                      {...register('type', { required: 'Type is required' })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Type</option>
                      {instituteTypes.map(type => (
                        <option key={type} value={type}>
                          {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                    {errors.type && (
                      <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      {...register('description')}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-b pb-6">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Numbers (comma separated) *
                    </label>
                    <input
                      {...register('phoneNumbers', { 
                        required: 'At least one phone number is required',
                        setValueAs: (value) => value.split(',').map((phone: string) => phone.trim())
                      })}
                      placeholder="+8801234567890, +8801234567891"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    {errors.phoneNumbers && (
                      <p className="text-red-500 text-sm mt-1">{errors.phoneNumbers.message}</p>
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
                      Website
                    </label>
                    <input
                      {...register('website')}
                      placeholder="https://example.com"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="border-b pb-6">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Address Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Street Address *
                    </label>
                    <input
                      {...register('address.street', { required: 'Street address is required' })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    {errors.address?.street && (
                      <p className="text-red-500 text-sm mt-1">{errors.address.street.message}</p>
                    )}
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

              {/* Contact Person */}
              <div className="border-b pb-6">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Contact Person</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name *
                    </label>
                    <input
                      {...register('contactPerson.name', { required: 'Contact person name is required' })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    {errors.contactPerson?.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.contactPerson.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title *
                    </label>
                    <input
                      {...register('contactPerson.title', { required: 'Contact person title is required' })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    {errors.contactPerson?.title && (
                      <p className="text-red-500 text-sm mt-1">{errors.contactPerson.title.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number *
                    </label>
                    <input
                      {...register('contactPerson.phoneNumber', { required: 'Contact person phone is required' })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    {errors.contactPerson?.phoneNumber && (
                      <p className="text-red-500 text-sm mt-1">{errors.contactPerson.phoneNumber.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      {...register('contactPerson.email')}
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Services */}
              <div className="border-b pb-6">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Services Offered</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries({
                    bloodCollection: 'Blood Collection',
                    bloodTesting: 'Blood Testing',
                    bloodStorage: 'Blood Storage',
                    emergencyServices: 'Emergency Services',
                    mobileBloodDrive: 'Mobile Blood Drive',
                    apheresis: 'Apheresis'
                  }).map(([key, label]) => (
                    <label key={key} className="flex items-center">
                      <input
                        {...register(`services.${key}` as keyof BloodInstituteForm)}
                        type="checkbox"
                        defaultChecked={key === 'bloodCollection'}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Operating Hours */}
              <div className="border-b pb-6">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Operating Hours</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {days.map((day) => (
                    <div key={day} className="flex items-center space-x-4">
                      <div className="w-20">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                          {day}
                        </label>
                      </div>
                      <div className="flex-1 flex items-center space-x-2">
                        <input
                          {...register(`operatingHours.${day}.open` as keyof BloodInstituteForm)}
                          type="time"
                          defaultValue={day === 'sunday' ? '09:00' : '08:00'}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          {...register(`operatingHours.${day}.close` as keyof BloodInstituteForm)}
                          type="time"
                          defaultValue={day === 'sunday' ? '17:00' : '18:00'}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <label className="flex items-center">
                          <input
                            {...register(`operatingHours.${day}.isClosed` as keyof BloodInstituteForm)}
                            type="checkbox"
                            defaultChecked={day === 'sunday'}
                            className="mr-1"
                          />
                          <span className="text-xs text-gray-500">Closed</span>
                        </label>
                      </div>
                    </div>
                  ))}
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
                  {isSubmitting ? 'Saving...' : (editingInstitute ? 'Update Institute' : 'Create Institute')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminBloodInstitutes
