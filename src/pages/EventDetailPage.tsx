import LoadingSpinner from '@/components/UI/LoadingSpinner'
import { donationApi, eventsApi, uploadApi } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  FileImage,
  Mail,
  MapPin,
  Phone,
  Share2,
  Star,
  Tag,
  User,
  UserPlus,
  Users
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'

interface RegistrationForm {
  participantName: string
  participantPhone: string
  participantEmail?: string
  paymentMethod?: string
  transactionId?: string
}

const EventDetailPage = () => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const [event, setEvent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [donationSettings, setDonationSettings] = useState<any>(null)
  const [receiptImage, setReceiptImage] = useState<any>(null)
  const [uploadingReceipt, setUploadingReceipt] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<RegistrationForm>()

  const paymentMethod = watch('paymentMethod')

  useEffect(() => {
    if (id) {
      fetchEvent()
      fetchDonationSettings()
    }
  }, [id])

  useEffect(() => {
    // Auto-fill form if user is logged in
    if (user) {
      reset({
        participantName: user.username || '',
        participantPhone: '', // User can enter their phone
        participantEmail: user.email || ''
      })
    }
  }, [user, reset])

  const fetchEvent = async () => {
    setIsLoading(true)
    setError('') // Clear any previous errors
    try {
      const response = await eventsApi.getById(id!)
      if (response.data.success) {
        
        setEvent(response.data.data)
      } else {
        console.error('Event fetch failed:', response.data)
        setError(t('eventDetailPage.eventNotFound'))
      }
    } catch (error) {
      console.error('Error fetching event:', error)
      setError(t('eventDetailPage.errorFetchingEvent'))
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDonationSettings = async () => {
    try {
      const response = await donationApi.getSettings()
      setDonationSettings(response.data.data)
    } catch (error) {
      console.error('Error fetching donation settings:', error)
    }
  }

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setUploadingReceipt(true)
      
      try {
        const response = await uploadApi.single(file, 'receipts')
        setReceiptImage({
          url: response.data.data.url,
          publicId: response.data.data.publicId,
          filename: response.data.data.filename
        })
        toast.success(t('eventDetailPage.receiptUploaded'))
      } catch (error) {
        console.error('Error uploading receipt:', error)
        toast.error('Failed to upload receipt')
      } finally {
        setUploadingReceipt(false)
      }
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    const title = event?.title || 'Event'
    const text = `${title} - ${event?.description || ''}`

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url
        })
        toast.success(t('common.shareSuccessful'))
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          toast.error(t('common.shareFailed'))
        }
      }
    } else {
      // Fallback: copy link to clipboard
      try {
        await navigator.clipboard.writeText(url)
        toast.success(t('common.linkCopied'))
      } catch (error) {
        toast.error(t('common.linkCopyFailed'))
      }
    }
  }

  const handleRegister = async (data: RegistrationForm) => {
    setIsRegistering(true)
    setError('')
    setSuccess('')

    try {
      const registrationData: any = {
        participantName: data.participantName,
        participantPhone: data.participantPhone,
        participantEmail: data.participantEmail
      }

      // Add payment info for paid events
      if (event.fee > 0) {
        if (!data.paymentMethod || !data.transactionId) {
          setError('Payment method and transaction ID are required for paid events')
          setIsRegistering(false)
          return
        }

        registrationData.paymentInfo = {
          paymentMethod: data.paymentMethod,
          transactionId: data.transactionId,
          receiptImage: receiptImage
        }
      }

      const response = await eventsApi.registerForEvent(id!, registrationData)
      
      if (response.data.success) {
        setSuccess(
          event.fee > 0 
            ? 'Registration submitted successfully! Your payment will be verified shortly.'
            : 'Successfully registered for the event!'
        )
        setShowRegistrationForm(false)
        await fetchEvent()
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      setError(error.response?.data?.message || t('eventDetailPage.registrationError'))
    } finally {
      setIsRegistering(false)
    }
  }

  const getPaymentMethods = () => {
    if (!donationSettings) return []
    
    const methods = []
    
    // Mobile banking options
    Object.entries(donationSettings.mobileBanking).forEach(([key, service]: [string, any]) => {
      if (service.enabled) {
        methods.push({
          value: key,
          label: key === 'bkash' ? 'bKash' : key.charAt(0).toUpperCase() + key.slice(1),
          number: service.number,
          type: service.type,
          instructions: service.instructions
        })
      }
    })
    
    // Bank transfer
    if (donationSettings.bankAccount.enabled) {
      methods.push({
        value: 'bank_transfer',
        label: 'Bank Transfer',
        number: donationSettings.bankAccount.accountNumber,
        type: 'Bank Account',
        instructions: `Transfer to ${donationSettings.bankAccount.bankName}, Account: ${donationSettings.bankAccount.accountNumber}`
      })
    }
    
    return methods
  }

  const getSelectedPaymentInfo = () => {
    if (!paymentMethod) return null
    return getPaymentMethods().find(method => method.value === paymentMethod)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'environment':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'education':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'social':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      case 'health':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'cultural':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'sports':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const nextImage = () => {
    if (event?.images && event.images.length > 1) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === event.images.length - 1 ? 0 : prevIndex + 1
      )
    }
  }

  const prevImage = () => {
    if (event?.images && event.images.length > 1) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? event.images.length - 1 : prevIndex - 1
      )
    }
  }

  // Reset image index when event changes and ensure it's within bounds
  useEffect(() => {
    if (event?.images && event.images.length > 0) {
      setCurrentImageIndex(0)
    }
  }, [event])

  // Safety check for currentImageIndex
  const safeImageIndex = event?.images && event.images.length > 0 
    ? Math.min(currentImageIndex, event.images.length - 1)
    : 0

  // Helper function to safely check if registration is open
  const isRegistrationOpen = () => {
    if (!event || !event.registrationRequired || event.status !== 'upcoming') {
      return false
    }
    
    // Check if registration is explicitly closed
    if (event.isRegistrationOpen === false) {
      return false
    }
    
    // Check capacity
    if (event.maxParticipants && event.currentParticipants >= event.maxParticipants) {
      return false
    }
    
    // Check deadline
    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
      return false
    }
    
    return true
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-12 h-12 text-red-500 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('eventDetailPage.error')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Link to="/events" className="btn btn-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('eventDetailPage.backToEvents')}
          </Link>
        </div>
      </div>
    )
  }

  if (!event) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex items-center justify-between"
        >
          <Link
            to="/events"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('eventDetailPage.backToEvents')}
          </Link>
          
          {/* Share Button */}
          <button
            onClick={handleShare}
            className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            <Share2 className="w-4 h-4 mr-2" />
            {t('common.share')}
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden"
        >
          {event.images && Array.isArray(event.images) && event.images.length > 0 && (
            <div className="relative h-64 md:h-80">
              <img
                src={event.images[safeImageIndex]?.url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40" />
              
              {/* Navigation arrows for multiple images */}
              {event.images.length > 1 && (
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

              {/* Image counter */}
              {event.images.length > 1 && (
                <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                  {safeImageIndex + 1} / {event.images.length}
                </div>
              )}
              
              <div className="absolute top-4 left-4 flex gap-2">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getCategoryColor(event.category)}`}>
                  {t(`eventsPage.categories.${event.category}`)}
                </span>
                {event.isFeatured && (
                  <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full flex items-center">
                    <Star className="w-4 h-4 mr-1 fill-current" />
                    <span className="text-sm font-medium">{t('eventDetailPage.featured')}</span>
                  </div>
                )}
              </div>

              <div className="absolute bottom-4 left-4 right-4">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {event.title}
                </h1>
                <p className="text-gray-200 text-lg">
                  {event.description}
                </p>
              </div>
            </div>
          )}

          {/* Image Thumbnail Gallery */}
          {event.images && Array.isArray(event.images) && event.images.length > 1 && (
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {t('eventDetailPage.eventGallery')} ({t('eventDetailPage.imagesCount', { count: event.images.length })})
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {event.images.map((image: any, index: number) => (
                    <div
                      key={index}
                      className={`relative cursor-pointer rounded-lg overflow-hidden aspect-square ${
                        index === safeImageIndex 
                          ? 'ring-4 ring-blue-500' 
                          : 'hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-600'
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <img
                        src={image.url}
                        alt={`${event.title} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {image.isMain && (
                        <div className="absolute top-1 left-1 bg-blue-500 text-white px-1 py-0.5 rounded text-xs font-medium">
                          {t('eventDetailPage.mainImage')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <Calendar className="w-5 h-5 mr-3 text-primary-600 dark:text-primary-400" />
                  <div>
                    <p className="font-medium">{formatDate(event.eventDate)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatTime(event.eventDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start text-gray-700 dark:text-gray-300">
                  <MapPin className="w-5 h-5 mr-3 mt-1 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{event.location?.address || t('eventDetailPage.locationNotSpecified')}</p>
                  </div>
                </div>

                {event.fee && event.fee > 0 && (
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <DollarSign className="w-5 h-5 mr-3 text-primary-600 dark:text-primary-400" />
                    <div>
                      <p className="font-medium">৳{event.fee}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('eventDetailPage.participationFee')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {event.registrationRequired && (
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <Users className="w-5 h-5 mr-3 text-primary-600 dark:text-primary-400" />
                    <div>
                      <p className="font-medium">
                        {event.currentParticipants || 0}
                        {event.maxParticipants && `/${event.maxParticipants}`} {t('eventDetailPage.participants')}
                      </p>
                    </div>
                  </div>
                )}

                {(event.contactInfo?.phone || event.contactInfo?.email) && (
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white mb-2">
                      {t('eventDetailPage.contact')}
                    </p>
                    {event.contactInfo?.phone && (
                      <div className="flex items-center text-gray-700 dark:text-gray-300 mb-1">
                        <Phone className="w-4 h-4 mr-2 text-primary-600 dark:text-primary-400" />
                        <a href={`tel:${event.contactInfo.phone}`} className="hover:underline">
                          {event.contactInfo.phone}
                        </a>
                      </div>
                    )}
                    {event.contactInfo?.email && (
                      <div className="flex items-center text-gray-700 dark:text-gray-300">
                        <Mail className="w-4 h-4 mr-2 text-primary-600 dark:text-primary-400" />
                        <a href={`mailto:${event.contactInfo.email}`} className="hover:underline">
                          {event.contactInfo.email}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {event.registrationRequired && event.status === 'upcoming' && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 mb-8 border border-blue-100 dark:border-gray-600">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
                    <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('eventDetailPage.registration')}
                  </h3>
                </div>
                
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-4 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
                    <p className="text-green-800 dark:text-green-300">{success}</p>
                  </motion.div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" />
                    <p className="text-red-800 dark:text-red-300">{error}</p>
                  </motion.div>
                )}

                {isRegistrationOpen() ? (
                  <div>
                    {!showRegistrationForm ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('eventDetailPage.eventCapacity')}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {event.currentParticipants}{event.maxParticipants && `/${event.maxParticipants}`} {t('eventDetailPage.registered')}
                            </span>
                          </div>
                          {event.maxParticipants && (
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min((event.currentParticipants / event.maxParticipants) * 100, 100)}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {t('eventDetailPage.registrationInstructions')}
                        </p>
                        
                        <button
                          onClick={() => setShowRegistrationForm(true)}
                          className="btn btn-primary w-full sm:w-auto group flex items-center justify-center"
                        >
                          <UserPlus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                          {t('eventDetailPage.registerNow')}
                        </button>
                      </motion.div>
                    ) : (
                      <motion.form
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        onSubmit={handleSubmit(handleRegister)} 
                        className="bg-white dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              <span className="flex items-center">
                                <User className="w-4 h-4 mr-2 text-gray-500" />
                                {t('eventDetailPage.participantName')} *
                              </span>
                            </label>
                            <input
                              {...register('participantName', { 
                                required: 'Name is required',
                                minLength: { value: 2, message: 'Name must be at least 2 characters' }
                              })}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              placeholder={t('eventDetailPage.enterYourName')}
                            />
                            {errors.participantName && (
                              <p className="text-red-500 text-sm mt-1 flex items-center">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {errors.participantName.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              <span className="flex items-center">
                                <Phone className="w-4 h-4 mr-2 text-gray-500" />
                                {t('eventDetailPage.phoneNumber')} *
                              </span>
                            </label>
                            <input
                              {...register('participantPhone', { 
                                required: 'Phone number is required',
                                pattern: {
                                  value: /^[+]?[\d\s\-\(\)]+$/,
                                  message: 'Please enter a valid phone number'
                                }
                              })}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              placeholder={t('eventDetailPage.enterYourPhone')}
                            />
                            {errors.participantPhone && (
                              <p className="text-red-500 text-sm mt-1 flex items-center">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {errors.participantPhone.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              <span className="flex items-center">
                                <Mail className="w-4 h-4 mr-2 text-gray-500" />
                                {t('eventDetailPage.emailAddress')} ({t('eventDetailPage.optional')})
                              </span>
                            </label>
                            <input
                              type="email"
                              {...register('participantEmail', {
                                pattern: {
                                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                  message: 'Please enter a valid email address'
                                }
                              })}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              placeholder={t('eventDetailPage.enterYourEmail')}
                            />
                            {errors.participantEmail && (
                              <p className="text-red-500 text-sm mt-1 flex items-center">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {errors.participantEmail.message}
                              </p>
                            )}
                          </div>
                        </div>

                        {event.fee > 0 && (
                          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                              <DollarSign className="w-5 h-5 mr-2 text-amber-600 dark:text-amber-400" />
                              {t('eventDetailPage.paymentInformation')}
                            </h4>
                            
                          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
                              <div className="flex items-center justify-between mb-2">
                              <span className="text-amber-800 dark:text-amber-300 font-medium">
                                  {t('eventDetailPage.registrationFee')}: ৳{event.fee}
                              </span>
                              </div>
                              <p className="text-amber-700 dark:text-amber-400 text-sm">
                                {t('eventDetailPage.paymentInstructions')}
                              </p>
                            </div>

                            {/* Payment Method Selection */}
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('eventDetailPage.paymentMethod')} *
                              </label>
                              <select
                                {...register('paymentMethod', { required: t('eventDetailPage.paymentMethodRequired') })}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              >
                                <option value="">{t('eventDetailPage.selectPaymentMethod')}</option>
                                {getPaymentMethods().map((method) => (
                                  <option key={method.value} value={method.value}>
                                    {method.label} ({method.type})
                                  </option>
                                ))}
                              </select>
                              {errors.paymentMethod && (
                                <p className="text-red-500 text-sm mt-1 flex items-center">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  {errors.paymentMethod.message}
                                </p>
                              )}
                            </div>

                            {/* Payment Instructions */}
                            {paymentMethod && getSelectedPaymentInfo() && (
                              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                                <h5 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                                  {t('eventDetailPage.paymentInstructionsFor', { method: getSelectedPaymentInfo()?.label })}
                                </h5>
                                <div className="text-blue-700 dark:text-blue-400 text-sm space-y-1">
                                  <p><strong>{t('eventDetailPage.paymentNumber')}:</strong> {getSelectedPaymentInfo()?.number}</p>
                                  <p><strong>{t('eventDetailPage.paymentInstructionsText')}:</strong> {getSelectedPaymentInfo()?.instructions}</p>
                                </div>
                              </div>
                            )}

                            {/* Transaction ID */}
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('eventDetailPage.transactionId')} *
                              </label>
                              <input
                                {...register('transactionId', { 
                                  required: t('eventDetailPage.transactionIdRequired'),
                                  minLength: { value: 3, message: t('eventDetailPage.transactionIdMinLength') }
                                })}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder={t('eventDetailPage.enterTransactionId')}
                              />
                              {errors.transactionId && (
                                <p className="text-red-500 text-sm mt-1 flex items-center">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  {errors.transactionId.message}
                                </p>
                              )}
                            </div>

                            {/* Receipt Upload */}
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('eventDetailPage.paymentReceiptOptional')}
                              </label>
                              <div className="space-y-3">
                                <div className="flex items-center space-x-4">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleReceiptUpload}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                  />
                                  {uploadingReceipt && (
                                    <div className="text-sm text-blue-600 flex items-center">
                                      <LoadingSpinner size="sm" />
                                      <span className="ml-2">{t('eventDetailPage.uploading')}</span>
                                    </div>
                                  )}
                                </div>
                                
                                {receiptImage && (
                                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                                    <div className="flex items-center text-green-800 dark:text-green-300">
                                      <FileImage className="w-4 h-4 mr-2" />
                                      <span className="text-sm font-medium">{t('eventDetailPage.receiptUploaded')}</span>
                                    </div>
                                    <p className="text-green-700 dark:text-green-400 text-xs mt-1">
                                      {receiptImage.filename}
                                    </p>
                                  </div>
                                )}
                                
                                <p className="text-gray-500 dark:text-gray-400 text-xs">
                                  {t('eventDetailPage.uploadReceipt')}
                                </p>
                              </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-400">
                              <p className="font-medium mb-1">{t('eventDetailPage.importantNotes')}</p>
                              <ul className="list-disc list-inside space-y-1 text-xs">
                                <li>{t('eventDetailPage.paymentNote1')}</li>
                                <li>{t('eventDetailPage.paymentNote2')}</li>
                                <li>{t('eventDetailPage.paymentNote3')}</li>
                              </ul>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-3 mt-4">
                          <button
                            type="submit"
                            disabled={isRegistering}
                            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex-1 group items-center "
                          >
                            {isRegistering ? (
                              <>
                                <LoadingSpinner size="sm" />
                                <span className="ml-2">{t('eventDetailPage.registering')}</span>
                              </>
                            ) : (
                              <div className="flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                {t('eventDetailPage.confirmRegistration')}
                              </div>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowRegistrationForm(false)}
                            className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            {t('eventDetailPage.cancel')}
                          </button>
                        </div>
                      </motion.form>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="bg-yellow-100 dark:bg-yellow-900/20 rounded-full p-3 w-fit mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                      {t('eventDetailPage.registrationClosedMessage')}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="prose prose-gray dark:prose-invert max-w-none mb-8">
              <h2>{t('eventDetailPage.aboutEvent')}</h2>
              <div dangerouslySetInnerHTML={{ __html: event.content.replace(/\n/g, '<br>') }} />
            </div>

            {event.tags && event.tags.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex items-center mb-3">
                  <Tag className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {t('eventDetailPage.tags')}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default EventDetailPage 