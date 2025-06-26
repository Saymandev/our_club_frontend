import { eventsApi, uploadApi } from '@/services/api'
import { motion } from 'framer-motion'
import { Calendar, Edit, Plus, Search, Star, ToggleLeft, ToggleRight, Trash2, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

interface Event {
  _id: string
  title: string
  description: string
  content: string
  eventDate: string
  endDate?: string
  location: {
    address: string
    coordinates?: {
      latitude: number
      longitude: number
    }
  }
  organizer: string
  contactInfo: {
    phone?: string
    email?: string
  }
  category: 'environment' | 'education' | 'social' | 'health' | 'cultural' | 'sports' | 'other'
  registrationRequired: boolean
  maxParticipants?: number
  currentParticipants: number
  registrationDeadline?: string
  fee: number
  isPublished: boolean
  isFeatured: boolean
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  tags: string[]
  createdAt: string
  updatedAt: string
  images?: { url: string; publicId: string; filename: string; isMain: boolean }[]
}

interface EventForm {
  title: string
  description: string
  content: string
  eventDate: string
  endDate?: string
  locationAddress: string
  locationLatitude?: number
  locationLongitude?: number
  organizer: string
  contactPhone?: string
  contactEmail?: string
  category: 'environment' | 'education' | 'social' | 'health' | 'cultural' | 'sports' | 'other'
  registrationRequired: boolean
  maxParticipants?: number
  registrationDeadline?: string
  fee: number
  isPublished: boolean
  isFeatured: boolean
  tags: string
}

const AdminEvents = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [viewingRegistrations, setViewingRegistrations] = useState<Event | null>(null)
  const [registrations, setRegistrations] = useState<any[]>([])
  const [loadingRegistrations, setLoadingRegistrations] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [eventImages, setEventImages] = useState<{ url: string; publicId: string; filename: string; isMain: boolean }[]>([])
  const [uploading, setUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<EventForm>()

  const registrationRequired = watch('registrationRequired')

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await eventsApi.getAllAdmin({
        limit: 50,
        status: statusFilter === 'all' ? undefined : statusFilter,
        category: categoryFilter === 'all' ? undefined : categoryFilter
      })
      setEvents(response.data.data)
    } catch (error) {
      toast.error('Failed to fetch events')
    } finally {
      setLoading(false)
    }
  }

  const fetchRegistrations = async (eventId: string) => {
    try {
      setLoadingRegistrations(true)
      const response = await eventsApi.getEventRegistrations(eventId)
      if (response.data.success) {
        setRegistrations(response.data.data)
      }
    } catch (error) {
      toast.error('Failed to fetch registrations')
    } finally {
      setLoadingRegistrations(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setUploading(true)
      
      try {
        const uploadPromises = files.map(async (file) => {
          const response = await uploadApi.single(file, 'events')
          return {
            url: response.data.data.url,
            publicId: response.data.data.publicId,
            filename: response.data.data.filename,
            isMain: eventImages.length === 0 && files.indexOf(file) === 0 // Set first image as main if no images exist
          }
        })
        
        const uploadedImages = await Promise.all(uploadPromises)
        setEventImages([...eventImages, ...uploadedImages])
        toast.success(`${uploadedImages.length} image(s) uploaded successfully`)
      } catch (error) {
        console.error('Error uploading images:', error)
        toast.error('Failed to upload images')
      } finally {
        setUploading(false)
      }
    }
  }

  const handleCreateOrUpdate = async (data: EventForm) => {
    setIsSubmitting(true)
    try {
      // Validate dates before submission
      if (!data.eventDate) {
        toast.error('Event date is required')
        setIsSubmitting(false)
        return
      }

      const eventDate = new Date(data.eventDate)
      const now = new Date()
      
      if (eventDate <= now) {
        toast.error('Event date must be in the future')
        setIsSubmitting(false)
        return
      }

      if (data.endDate) {
        const endDate = new Date(data.endDate)
        if (endDate <= eventDate) {
          toast.error('End date must be after event date')
          setIsSubmitting(false)
          return
        }
      }

      if (data.registrationDeadline && data.registrationRequired) {
        const regDeadline = new Date(data.registrationDeadline)
        if (regDeadline >= eventDate) {
          toast.error('Registration deadline must be before event date')
          setIsSubmitting(false)
          return
        }
      }

      if (data.registrationRequired && (!data.maxParticipants || Number(data.maxParticipants) < 1)) {
        toast.error('Maximum participants is required and must be at least 1 when registration is enabled')
        setIsSubmitting(false)
        return
      }

      // Transform form data
      const eventData = {
        title: data.title,
        description: data.description,
        content: data.content,
        eventDate: eventDate.toISOString(), // Convert to ISO string
        endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined, // Convert to ISO string
        location: {
          address: data.locationAddress,
          coordinates: (data.locationLatitude && data.locationLongitude) ? {
            latitude: Number(data.locationLatitude),
            longitude: Number(data.locationLongitude)
          } : undefined
        },
        organizer: data.organizer,
        contactInfo: {
          phone: data.contactPhone || undefined,
          email: data.contactEmail || undefined
        },
        category: data.category,
        registrationRequired: data.registrationRequired,
        maxParticipants: data.registrationRequired ? Number(data.maxParticipants) : undefined,
        registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline).toISOString() : undefined, // Convert to ISO string
        fee: Number(data.fee) || 0,
        isPublished: data.isPublished,
        isFeatured: data.isFeatured,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        images: eventImages // Include images directly in event data
      }

      console.log('Sending event data:', eventData) // Debug log
      
      if (editingEvent) {
        await eventsApi.update(editingEvent._id, eventData)
        toast.success('Event updated successfully')
      } else {
        await eventsApi.create(eventData)
        toast.success('Event created successfully')
      }

      await fetchEvents()
      setShowModal(false)
      setEditingEvent(null)
      setEventImages([])
      reset()
    } catch (error: any) {
      console.error('Create/Update event error:', error)
      console.log('Full error response:', error.response) // Additional debugging
      
      if (error.response?.data?.errors) {
        // Handle validation errors
        error.response.data.errors.forEach((err: any) => {
          toast.error(`${err.field}: ${err.message}`)
        })
      } else if (error.response?.data?.error) {
        // Handle other backend errors with detailed error message
        toast.error(`${error.response.data.message}: ${error.response.data.error}`)
      } else {
        toast.error(error.response?.data?.message || 'Failed to save event')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (event: Event) => {
    setEditingEvent(event)
    setEventImages(event.images || [])
    
    const formatDateTime = (dateString: string) => {
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}`
    }

    reset({
      title: event.title,
      description: event.description,
      content: event.content,
      eventDate: formatDateTime(event.eventDate),
      endDate: event.endDate ? formatDateTime(event.endDate) : '',
      locationAddress: event.location.address,
      locationLatitude: event.location.coordinates?.latitude,
      locationLongitude: event.location.coordinates?.longitude,
      organizer: event.organizer,
      contactPhone: event.contactInfo?.phone || '',
      contactEmail: event.contactInfo?.email || '',
      category: event.category,
      registrationRequired: event.registrationRequired,
      maxParticipants: event.maxParticipants,
      registrationDeadline: event.registrationDeadline ? formatDateTime(event.registrationDeadline) : '',
      fee: event.fee,
      isPublished: event.isPublished,
      isFeatured: event.isFeatured,
      tags: event.tags?.join(', ') || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return
    
    try {
      await eventsApi.delete(id)
      toast.success('Event deleted successfully!')
      fetchEvents()
    } catch (error) {
      toast.error('Failed to delete event')
    }
  }

  const handleTogglePublish = async (id: string) => {
    try {
      await eventsApi.togglePublish(id)
      toast.success('Event status updated!')
      fetchEvents()
    } catch (error) {
      toast.error('Failed to update event status')
    }
  }

  const handleToggleFeature = async (id: string) => {
    try {
      await eventsApi.toggleFeature(id)
      toast.success('Event featured status updated!')
      fetchEvents()
    } catch (error) {
      toast.error('Failed to update event featured status')
    }
  }

  const handleViewRegistrations = async (event: Event) => {
    setViewingRegistrations(event)
    await fetchRegistrations(event._id)
  }

  const setMainImage = (index: number) => {
    const newImages = eventImages.map((image, i) => ({
      ...image,
      isMain: i === index
    }))
    setEventImages(newImages)
  }

  const removeImage = (index: number) => {
    const newImages = eventImages.filter((_, i) => i !== index)
    setEventImages(newImages)
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'environment': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'education': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'social': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      case 'health': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'cultural': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'sports': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'ongoing': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">
            Events
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage club events and activities
          </p>
        </div>
        <button 
          onClick={() => {
            setEditingEvent(null)
            reset({
              category: 'other',
              registrationRequired: false,
              fee: 0,
              isPublished: false,
              isFeatured: false
            })
            setShowModal(true)
          }}
          className="btn-primary flex items-center space-x-2 w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>New Event</span>
        </button>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Events
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title or description..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:w-80">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="environment">Environment</option>
                <option value="education">Education</option>
                <option value="social">Social</option>
                <option value="health">Health</option>
                <option value="cultural">Cultural</option>
                <option value="sports">Sports</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
        
        {(searchTerm || statusFilter !== 'all' || categoryFilter !== 'all') && (
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredEvents.length} of {events.length} events
            </span>
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
                setCategoryFilter('all')
              }}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Clear Filters
            </button>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
      >
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Loading events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No events found</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block lg:hidden">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredEvents.map((event) => (
                  <div key={event._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {event.title}
                          </h3>
                          {event.isFeatured && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {event.description}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        {event.registrationRequired && (
                          <button
                            onClick={() => handleViewRegistrations(event)}
                            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 p-1"
                          >
                            <Users className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(event)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(event._id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                          {event.category}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(event.eventDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Published
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredEvents.map((event) => (
                    <tr key={event._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {event.title}
                            </div>
                            {event.isFeatured && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {event.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                          {event.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(event.eventDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleTogglePublish(event._id)}
                          className="flex items-center space-x-2"
                        >
                          {event.isPublished ? (
                            <ToggleRight className="w-5 h-5 text-green-500" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-gray-400" />
                          )}
                          <span className={`text-sm ${event.isPublished ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                            {event.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {event.registrationRequired && (
                            <button
                              onClick={() => handleViewRegistrations(event)}
                              className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 p-1"
                              title="View Registrations"
                            >
                              <Users className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleToggleFeature(event._id)}
                            className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 p-1"
                            title={event.isFeatured ? 'Remove from featured' : 'Mark as featured'}
                          >
                            <Star className={`w-4 h-4 ${event.isFeatured ? 'fill-current' : ''}`} />
                          </button>
                          <button
                            onClick={() => handleEdit(event)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(event._id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </motion.div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 p-0 sm:p-4 sm:flex sm:items-center sm:justify-center md:top-48">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-4xl sm:rounded-lg shadow-xl overflow-y-auto"
          >
            <div className="p-4 sm:p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </h2>
              
              <form onSubmit={handleSubmit(handleCreateOrUpdate)} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Basic Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Event Title *
                    </label>
                    <input
                      {...register('title', { required: 'Title is required' })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter event title"
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Short Description *
                    </label>
                    <textarea
                      {...register('description', { required: 'Description is required' })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Brief description of the event"
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Content *
                    </label>
                    <textarea
                      {...register('content', { required: 'Content is required' })}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Detailed event information, agenda, requirements, etc."
                    />
                    {errors.content && (
                      <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
                    )}
                  </div>
                </div>

                {/* Date and Location */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Date & Location</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Event Date *
                      </label>
                      <input
                        type="datetime-local"
                        {...register('eventDate', { required: 'Event date is required' })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {errors.eventDate && (
                        <p className="text-red-500 text-sm mt-1">{errors.eventDate.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        End Date (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        {...register('endDate')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Location Address *
                    </label>
                    <input
                      {...register('locationAddress', { required: 'Location is required' })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Event location address"
                    />
                    {errors.locationAddress && (
                      <p className="text-red-500 text-sm mt-1">{errors.locationAddress.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Latitude (Optional)
                      </label>
                      <input
                        type="number"
                        step="any"
                        {...register('locationLatitude')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="23.8103"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Longitude (Optional)
                      </label>
                      <input
                        type="number"
                        step="any"
                        {...register('locationLongitude')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="90.4125"
                      />
                    </div>
                  </div>
                </div>

                {/* Event Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Event Details</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Category *
                      </label>
                      <select
                        {...register('category', { required: 'Category is required' })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="environment">Environment</option>
                        <option value="education">Education</option>
                        <option value="social">Social</option>
                        <option value="health">Health</option>
                        <option value="cultural">Cultural</option>
                        <option value="sports">Sports</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Organizer *
                      </label>
                      <input
                        {...register('organizer', { required: 'Organizer is required' })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Event organizer name"
                      />
                      {errors.organizer && (
                        <p className="text-red-500 text-sm mt-1">{errors.organizer.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Contact Phone
                      </label>
                      <input
                        {...register('contactPhone')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="+880-1711-111111"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        {...register('contactEmail')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="contact@example.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Registration & Fee */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Registration & Fee</h3>
                  
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('registrationRequired')}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Registration Required</span>
                    </label>
                  </div>

                  {registrationRequired && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Max Participants *
                        </label>
                        <input
                          type="number"
                          {...register('maxParticipants', {
                            required: registrationRequired ? 'Max Participants is required when registration is enabled' : false,
                            min: { value: 1, message: 'Must be at least 1 participant' }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="100"
                        />
                        {errors.maxParticipants && (
                          <p className="text-red-500 text-sm mt-1">{errors.maxParticipants.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Registration Deadline
                        </label>
                        <input
                          type="datetime-local"
                          {...register('registrationDeadline', {
                            validate: (value) => {
                              if (!value || !registrationRequired) return true
                              const eventDate = watch('eventDate')
                              if (!eventDate) return true
                              return new Date(value) < new Date(eventDate) || 'Registration deadline must be before event date'
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {errors.registrationDeadline && (
                          <p className="text-red-500 text-sm mt-1">{errors.registrationDeadline.message}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Participation Fee (BDT)
                    </label>
                    <input
                      type="number"
                      {...register('fee')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Settings</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tags (comma separated)
                    </label>
                    <input
                      {...register('tags')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="environment, sustainability, community"
                    />
                  </div>

                  <div className="flex items-center space-x-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('isPublished')}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Publish Event</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('isFeatured')}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Feature Event</span>
                    </label>
                  </div>
                </div>

                {/* Images Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Event Images</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Upload Images
                      </label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {uploading && (
                          <div className="text-sm text-blue-600">Uploading...</div>
                        )}
                      </div>
                    </div>

                    {/* Image Preview Grid */}
                    {eventImages.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {eventImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <div className="relative">
                              <img
                                src={image.url}
                                alt={`Event image ${index + 1}`}
                                className={`w-full h-32 object-cover rounded-lg border-2 transition-all ${
                                  image.isMain 
                                    ? 'border-blue-500 ring-2 ring-blue-200' 
                                    : 'border-gray-200 dark:border-gray-600'
                                }`}
                              />
                              
                              {/* Main image badge */}
                              {image.isMain && (
                                <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                  Main
                                </div>
                              )}
                              
                              {/* Action buttons */}
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100">
                                {!image.isMain && (
                                  <button
                                    type="button"
                                    onClick={() => setMainImage(index)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-colors"
                                    title="Set as main image"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                  </button>
                                )}
                                
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                                  title="Remove image"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            
                            <div className="mt-2 text-center">
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {image.filename}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {eventImages.length === 0 && (
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-500 dark:text-gray-400">No images uploaded</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                          Images make events more attractive and get more participants
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingEvent(null)
                      setEventImages([])
                      reset()
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Registrations Modal */}
      {viewingRegistrations && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 p-0 sm:p-4 sm:flex sm:items-center sm:justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-5xl sm:rounded-lg shadow-xl overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Event Registrations
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {viewingRegistrations.title}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setViewingRegistrations(null)
                    setRegistrations([])
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {loadingRegistrations ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">Loading registrations...</p>
                </div>
              ) : registrations.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No registrations yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {registrations.length} Participants
                    </h3>
                    <button
                      onClick={() => {
                        const csvContent = [
                          ['Name', 'Phone', 'Email', 'Registration Date', 'Status', 'Payment Status', 'Transaction ID'].join(','),
                          ...registrations.map(reg => [
                            reg.participantName,
                            reg.participantPhone,
                            reg.participantEmail || '',
                            new Date(reg.registrationDate).toLocaleDateString(),
                            reg.status,
                            reg.paymentStatus || 'N/A',
                            reg.paymentInfo?.transactionId || 'N/A'
                          ].join(','))
                        ].join('\n')
                        
                        const blob = new Blob([csvContent], { type: 'text/csv' })
                        const url = window.URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `${viewingRegistrations.title}-registrations.csv`
                        a.click()
                        window.URL.revokeObjectURL(url)
                      }}
                      className="btn btn-secondary text-sm"
                    >
                      Export CSV
                    </button>
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden md:block">
                    <div className="overflow-x-auto">
                      <table className="w-full border border-gray-200 dark:border-gray-700 rounded-lg">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Participant
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Contact
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Registration Date
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Payment
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {registrations.map((registration) => (
                            <tr key={registration._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-4 py-4">
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {registration.participantName}
                                  </div>
                                  {registration.user && (
                                    <div className="text-xs text-blue-600 dark:text-blue-400">
                                      Registered User
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {registration.participantPhone}
                                </div>
                                {registration.participantEmail && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {registration.participantEmail}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                                {new Date(registration.registrationDate).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-4">
                                <div className="text-sm">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    registration.paymentStatus === 'confirmed' 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                      : registration.paymentStatus === 'pending'
                                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                  }`}>
                                    {registration.paymentStatus || 'N/A'}
                                  </span>
                                  {registration.paymentInfo?.transactionId && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      TXN: {registration.paymentInfo.transactionId}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  registration.status === 'confirmed' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                    : registration.status === 'waitlisted'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                }`}>
                                  {registration.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-3">
                    {registrations.map((registration) => (
                      <div key={registration._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {registration.participantName}
                            </h4>
                            {registration.user && (
                              <span className="text-xs text-blue-600 dark:text-blue-400">
                                Registered User
                              </span>
                            )}
                          </div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            registration.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : registration.status === 'waitlisted'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {registration.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <p>Phone: {registration.participantPhone}</p>
                          {registration.participantEmail && (
                            <p>Email: {registration.participantEmail}</p>
                          )}
                          <p>Registered: {new Date(registration.registrationDate).toLocaleDateString()}</p>
                          <p>Payment: 
                            <span className={`ml-1 px-2 py-1 text-xs font-semibold rounded-full ${
                              registration.paymentStatus === 'confirmed' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : registration.paymentStatus === 'pending'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {registration.paymentStatus || 'N/A'}
                            </span>
                          </p>
                          {registration.paymentInfo?.transactionId && (
                            <p className="text-xs">TXN: {registration.paymentInfo.transactionId}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default AdminEvents 