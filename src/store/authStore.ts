import api, { authApi } from '@/services/api'
import toast from 'react-hot-toast'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  username: string
  email: string
  role: 'admin' | 'moderator'
  isActive: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
  // Blood donation fields
  bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
  contactNumber?: string
  lastDonationDate?: string
  daysSinceLastDonation?: number | null
  isAvailableForDonation?: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (data: RegisterData) => Promise<boolean>
  updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>
  initializeAuth: () => Promise<void>
  clearAuth: () => void
}

interface RegisterData {
  username: string
  email: string
  password: string
  role?: 'admin' | 'moderator'
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await authApi.login({ email, password })
          
          if (response.data.success) {
            const { user, token } = response.data
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false
            })
            
            // Set token in axios defaults
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`
            
            toast.success(`Welcome back, ${user.username}!`)
            return true
          } else {
            set({ isLoading: false })
            toast.error(response.data.message || 'Login failed')
            return false
          }
        } catch (error: any) {
          set({ isLoading: false })
          const message = error?.response?.data?.message || 'Login failed'
          toast.error(message)
          return false
        }
      },

      logout: async () => {
        try {
          await authApi.logout()
        } catch (error) {
          // Ignore logout errors
        }
        
        set({
          user: null,
          token: null,
          isAuthenticated: false
        })
        
        // Remove token from axios defaults
        delete api.defaults.headers.common['Authorization']
        
        toast.success('Logged out successfully')
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true })
        try {
          const response = await authApi.register(data)
          
          if (response.data.success) {
            const { user, token } = response.data
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false
            })
            
            // Set token in axios defaults
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`
            
            toast.success(`Welcome, ${user.username}!`)
            return true
          } else {
            set({ isLoading: false })
            toast.error(response.data.message || 'Registration failed')
            return false
          }
        } catch (error: any) {
          set({ isLoading: false })
          const message = error?.response?.data?.message || 'Registration failed'
          toast.error(message)
          return false
        }
      },

      updatePassword: async (currentPassword: string, newPassword: string) => {
        set({ isLoading: true })
        try {
          const response = await authApi.updatePassword({
            currentPassword,
            newPassword
          })
          
          if (response.data.success) {
            set({ isLoading: false })
            toast.success('Password updated successfully')
            return true
          } else {
            set({ isLoading: false })
            toast.error(response.data.message || 'Password update failed')
            return false
          }
        } catch (error: any) {
          set({ isLoading: false })
          const message = error?.response?.data?.message || 'Password update failed'
          toast.error(message)
          return false
        }
      },

      initializeAuth: async () => {
        const { token } = get()
        
        if (token) {
          set({ isLoading: true })
          try {
            // Set token in axios defaults
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`
            
            // Verify token is still valid
            const response = await authApi.getMe()
            
            if (response.data.success) {
              set({
                user: response.data.user,
                isAuthenticated: true,
                isLoading: false
              })
            } else {
              // Token is invalid, clear auth
              get().clearAuth()
            }
          } catch (error) {
            // Token is invalid, clear auth
            get().clearAuth()
          }
        } else {
          set({ isLoading: false })
        }
      },

      clearAuth: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        })
        
        // Remove token from axios defaults
        delete api.defaults.headers.common['Authorization']
      }
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
) 