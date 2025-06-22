import LoadingSpinner from '@/components/UI/LoadingSpinner'
import { eventsApi } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  DollarSign,
  Mail,
  MapPin,
  Phone,
  Star,
  Tag,
  User,
  UserPlus,
  Users
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'

interface RegistrationForm {
  participantName: string
  participantPhone: string
  participantEmail?: string
}

const EventDetailPage = () => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [event, setEvent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<RegistrationForm>()

  useEffect(() => {
    if (id) {
      fetchEvent()
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
    try {
      const response = await eventsApi.getById(id!)
      if (response.data.success) {
        setEvent(response.data.data)
      } else {
        setError(t('eventDetailPage.eventNotFound'))
      }
    } catch (error) {
      console.error('Error fetching event:', error)
      setError(t('eventDetailPage.errorFetchingEvent'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (data: RegistrationForm) => {
    setIsRegistering(true)
    setError('')
    setSuccess('')

    try {
      const response = await eventsApi.registerForEvent(id!, {
        participantName: data.participantName,
        participantPhone: data.participantPhone,
        participantEmail: data.participantEmail
      })
      
      if (response.data.success) {
        setSuccess(t('eventDetailPage.registrationSuccess'))
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
          className="mb-6"
        >
          <Link
            to="/events"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('eventDetailPage.backToEvents')}
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden"
        >
          {event.images && event.images.length > 0 && (
            <div className="relative h-64 md:h-80">
              <img
                src={event.images.find((img: any) => img.isMain)?.url || event.images[0]?.url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40" />
              
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
                    <p className="font-medium">{event.location.address}</p>
                  </div>
                </div>

                {event.fee > 0 && (
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
                        {event.currentParticipants}
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

                {event.isRegistrationOpen ? (
                  <div>
                    {!showRegistrationForm ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Event Capacity</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {event.currentParticipants}{event.maxParticipants && `/${event.maxParticipants}`} registered
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
                          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
                            <div className="flex items-center">
                              <DollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-2" />
                              <span className="text-amber-800 dark:text-amber-300 font-medium">
                                Registration Fee: ৳{event.fee}
                              </span>
                            </div>
                            <p className="text-amber-700 dark:text-amber-400 text-sm mt-1">
                              Payment will be collected at the event venue.
                            </p>
                          </div>
                        )}

                        <div className="flex gap-3">
                          <button
                            type="submit"
                            disabled={isRegistering}
                            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex-1 group"
                          >
                            {isRegistering ? (
                              <>
                                <LoadingSpinner size="sm" />
                                <span className="ml-2">{t('eventDetailPage.registering')}</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                {t('eventDetailPage.confirmRegistration')}
                              </>
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