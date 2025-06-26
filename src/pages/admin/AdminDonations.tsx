import { FormSkeleton } from '@/components/UI/Skeleton'
import { donationApi } from '@/services/api'
import { motion } from 'framer-motion'
import { Heart, Save, ToggleLeft, ToggleRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

interface DonationSettings {
  _id?: string;
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

const AdminDonations = () => {
  const [settings, setSettings] = useState<DonationSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<DonationSettings>()

  useEffect(() => {
    fetchDonationSettings()
  }, [])

  useEffect(() => {
    if (settings) {
      reset(settings)
    }
  }, [settings, reset])

  const fetchDonationSettings = async () => {
    try {
      setLoading(true)
      const response = await donationApi.getSettings()
      setSettings(response.data.data)
    } catch (error) {
      console.error('Failed to fetch donation settings:', error)
      toast.error('Failed to load donation settings')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleProvider = async (category: string, provider: string, currentEnabled: boolean) => {
    try {
      await donationApi.toggleProvider(category, provider, !currentEnabled)
      toast.success(`${provider} ${!currentEnabled ? 'enabled' : 'disabled'} successfully`)
      fetchDonationSettings() // Refresh data
    } catch (error) {
      console.error('Failed to toggle provider:', error)
      toast.error('Failed to update provider status')
    }
  }

  const onSubmit = async (data: DonationSettings) => {
    try {
      setSaving(true)
      await donationApi.updateSettings(data)
      toast.success('Donation settings updated successfully!')
      fetchDonationSettings() // Refresh data
    } catch (error: any) {
      console.error('Failed to update donation settings:', error)
      toast.error(error?.response?.data?.message || 'Failed to update donation settings')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all donation settings to default? This action cannot be undone.')) {
      return
    }

    try {
      setSaving(true)
      await donationApi.resetSettings()
      toast.success('Donation settings reset to default successfully!')
      fetchDonationSettings() // Refresh data
    } catch (error) {
      console.error('Failed to reset donation settings:', error)
      toast.error('Failed to reset donation settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <FormSkeleton />
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Failed to load donation settings</p>
        <button onClick={fetchDonationSettings} className="btn-primary mt-4">
          Retry
        </button>
      </div>
    )
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
            Donation Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage donation methods and information displayed to users
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleReset}
            disabled={saving}
            className="px-4 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
          >
            Reset to Default
          </button>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* General Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <Heart className="w-5 h-5 mr-2" />
            General Settings
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title (English)
              </label>
              <input
                {...register('general.title.en', { required: 'English title is required' })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Support Our Club"
              />
              {errors.general?.title?.en && (
                <p className="text-red-500 text-sm mt-1">{errors.general.title.en.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title (Bengali)
              </label>
              <input
                {...register('general.title.bn', { required: 'Bengali title is required' })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="আমাদের ক্লাবকে সহায়তা করুন"
              />
              {errors.general?.title?.bn && (
                <p className="text-red-500 text-sm mt-1">{errors.general.title.bn.message}</p>
              )}
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (English)
              </label>
              <textarea
                {...register('general.description.en', { required: 'English description is required' })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Your generous donations help us continue our mission..."
              />
              {errors.general?.description?.en && (
                <p className="text-red-500 text-sm mt-1">{errors.general.description.en.message}</p>
              )}
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (Bengali)
              </label>
              <textarea
                {...register('general.description.bn', { required: 'Bengali description is required' })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="আপনার উদার দান আমাদের মিশন চালিয়ে যেতে..."
              />
              {errors.general?.description?.bn && (
                <p className="text-red-500 text-sm mt-1">{errors.general.description.bn.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                {...register('general.contactEmail', { 
                  required: 'Contact email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="info@example.com"
              />
              {errors.general?.contactEmail && (
                <p className="text-red-500 text-sm mt-1">{errors.general.contactEmail.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contact Phone
              </label>
              <input
                {...register('general.contactPhone', { required: 'Contact phone is required' })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="01717-171717"
              />
              {errors.general?.contactPhone && (
                <p className="text-red-500 text-sm mt-1">{errors.general.contactPhone.message}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Mobile Banking */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            📱 Mobile Banking Services
          </h2>

          <div className="space-y-6">
            {Object.entries(settings.mobileBanking).map(([key, service]) => (
              <div key={key} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white capitalize">
                    {key === 'bkash' ? 'bKash' : key.charAt(0).toUpperCase() + key.slice(1)}
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleToggleProvider('mobileBanking', key, service.enabled)}
                    className="flex items-center space-x-2"
                  >
                    {service.enabled ? (
                      <ToggleRight className="w-6 h-6 text-green-500" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-gray-400" />
                    )}
                    <span className={`text-sm ${service.enabled ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      {service.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </button>
                </div>

                {service.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phone Number
                      </label>
                      <input
                        {...register(`mobileBanking.${key}.number` as any, { required: 'Phone number is required' })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="01712-345678"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Account Type
                      </label>
                      <select
                        {...register(`mobileBanking.${key}.type` as any)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Personal">Personal</option>
                        <option value="Agent">Agent</option>
                        <option value="Merchant">Merchant</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Instructions
                      </label>
                      <textarea
                        {...register(`mobileBanking.${key}.instructions` as any)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Send money instructions..."
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bank Account */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              🏦 Bank Account
            </h2>
            <button
              type="button"
              onClick={() => handleToggleProvider('bankAccount', 'bankAccount', settings.bankAccount.enabled)}
              className="flex items-center space-x-2"
            >
              {settings.bankAccount.enabled ? (
                <ToggleRight className="w-6 h-6 text-green-500" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-gray-400" />
              )}
              <span className={`text-sm ${settings.bankAccount.enabled ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {settings.bankAccount.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </button>
          </div>

          {settings.bankAccount.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bank Name
                </label>
                <input
                  {...register('bankAccount.bankName', { required: 'Bank name is required' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Dutch-Bangla Bank Limited"
                />
                {errors.bankAccount?.bankName && (
                  <p className="text-red-500 text-sm mt-1">{errors.bankAccount.bankName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Account Name
                </label>
                <input
                  {...register('bankAccount.accountName', { required: 'Account name is required' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="আঁধারে আলোর প্রজন্ম"
                />
                {errors.bankAccount?.accountName && (
                  <p className="text-red-500 text-sm mt-1">{errors.bankAccount.accountName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Account Number
                </label>
                <input
                  {...register('bankAccount.accountNumber', { 
                    required: 'Account number is required',
                    minLength: {
                      value: 10,
                      message: 'Account number must be at least 10 digits'
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1234567890123456"
                />
                {errors.bankAccount?.accountNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.bankAccount.accountNumber.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Routing Number
                </label>
                <input
                  {...register('bankAccount.routingNumber', { 
                    required: 'Routing number is required',
                    pattern: {
                      value: /^\d{9}$/,
                      message: 'Routing number must be exactly 9 digits'
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="090261234"
                />
                {errors.bankAccount?.routingNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.bankAccount.routingNumber.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Branch
                </label>
                <input
                  {...register('bankAccount.branch', { required: 'Branch is required' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Dhanmondi Branch"
                />
                {errors.bankAccount?.branch && (
                  <p className="text-red-500 text-sm mt-1">{errors.bankAccount.branch.message}</p>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex justify-end"
        >
          <button
            type="submit"
            disabled={saving || !isDirty}
            className="flex items-center space-x-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </motion.div>
      </form>
    </div>
  )
}

export default AdminDonations 