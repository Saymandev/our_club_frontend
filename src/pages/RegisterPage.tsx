import { authApi, bloodDonationApi } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { login: authLogin } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Basic info
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'moderator',
    
    // Blood donation info (optional)
    bloodGroup: '',
    contactNumber: '',
    wantsToDonate: false
  })

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error(t('bloodDonation.register.passwordsDontMatch'))
      return
    }

    if (formData.wantsToDonate && (!formData.bloodGroup || !formData.contactNumber)) {
      toast.error(t('bloodDonation.register.provideBloodInfo'))
      return
    }

    try {
      setLoading(true)
      
      // Step 1: Register the user
      await authApi.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role
      })

      toast.success(t('bloodDonation.register.registrationSuccessful'))

      // Step 2: Login the user
      await authApi.login({
        email: formData.email,
        password: formData.password
      })

      // Step 3: Add blood donation info if provided
      if (formData.wantsToDonate && formData.bloodGroup && formData.contactNumber) {
        try {
          await bloodDonationApi.updateBloodInfo({
            bloodGroup: formData.bloodGroup,
            contactNumber: formData.contactNumber
          })
          toast.success(t('bloodDonation.register.bloodInfoAdded'))
        } catch (bloodError) {
          console.error('Blood info error:', bloodError)
          toast.error(t('bloodDonation.register.bloodInfoFailed'))
        }
      }

      // Update auth state
      authLogin(formData.email, formData.password)
      
      // Redirect to appropriate page
      if (formData.wantsToDonate) {
        navigate('/my-blood-donation')
      } else {
        navigate('/')
      }

    } catch (error: any) {
      console.error('Registration error:', error)
      toast.error(error.response?.data?.message || t('bloodDonation.register.registrationFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('bloodDonation.register.title')}</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{t('bloodDonation.register.subtitle')}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('bloodDonation.register.basicInfo')}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('bloodDonation.register.username')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={t('bloodDonation.register.enterUsername')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('bloodDonation.register.email')}
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={t('bloodDonation.register.enterEmail')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('bloodDonation.register.password')}
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={t('bloodDonation.register.enterPassword')}
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('bloodDonation.register.confirmPassword')}
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={t('bloodDonation.register.confirmPasswordPlaceholder')}
                  />
                </div>
              </div>
            </div>

            {/* Blood Donation Section */}
            <div className="border-t dark:border-gray-700 pt-6">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="wantsToDonate"
                  checked={formData.wantsToDonate}
                  onChange={(e) => setFormData(prev => ({ ...prev, wantsToDonate: e.target.checked }))}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <label htmlFor="wantsToDonate" className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('bloodDonation.register.wantToDonate')}
                </label>
              </div>

              {formData.wantsToDonate && (
                <div className="space-y-4 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('bloodDonation.bloodGroupRequired')}
                    </label>
                    <select
                      required={formData.wantsToDonate}
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData(prev => ({ ...prev, bloodGroup: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                      required={formData.wantsToDonate}
                      value={formData.contactNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder={t('bloodDonation.enterContactNumber')}
                    />
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>{t('bloodDonation.register.privacyNote1')}</p>
                    <p>{t('bloodDonation.register.privacyNote2')}</p>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? t('bloodDonation.register.creatingAccount') : t('bloodDonation.register.createAccount')}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
              >
                {t('bloodDonation.register.alreadyHaveAccount')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage 