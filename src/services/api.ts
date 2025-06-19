import axios from 'axios'

// Create axios instance
const api = axios.create({
  baseURL: 'https://our-club-backend.onrender.com/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-storage')
    if (token) {
      try {
        const authData = JSON.parse(token)
        if (authData.state?.token) {
          config.headers.Authorization = `Bearer ${authData.state.token}`
        }
      } catch (error) {
        // Ignore token parsing errors
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect to login for admin routes or when user is authenticated
      const currentPath = window.location.pathname
      const isAdminRoute = currentPath.startsWith('/admin')
      const isAuthRoute = currentPath === '/login'
      
      // Clear auth data
      localStorage.removeItem('auth-storage')
      
      // Only redirect if it's an admin route or if user was authenticated
      if (isAdminRoute && !isAuthRoute) {
        window.location.href = '/login'
      }
    } 
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  register: (data: { username: string; email: string; password: string; role?: string }) =>
    api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/update-password', data),
}

// Announcements API
export const announcementsApi = {
  getAll: (params?: {
    page?: number
    limit?: number
    priority?: string
    tags?: string
  }) => api.get('/announcements', { params }),
  getById: (id: string) => api.get(`/announcements/${id}`),
  getAllAdmin: (params?: {
    page?: number
    limit?: number
    status?: string
    priority?: string
  }) => api.get('/announcements/admin/all', { params }),
  create: (data: any) => api.post('/announcements', data),
  update: (id: string, data: any) => api.put(`/announcements/${id}`, data),
  delete: (id: string) => api.delete(`/announcements/${id}`),
  togglePublish: (id: string) => api.patch(`/announcements/${id}/toggle-publish`),
}

// Historical Moments API
export const historicalMomentsApi = {
  getAll: (params?: {
    page?: number
    limit?: number
    mediaType?: string
    tags?: string
    highlighted?: string
  }) => api.get('/historical-moments', { params }),
  getById: (id: string) => api.get(`/historical-moments/${id}`),
  getHighlighted: (params?: { limit?: number }) =>
    api.get('/historical-moments/highlighted', { params }),
  getAllAdmin: (params?: {
    page?: number
    limit?: number
    mediaType?: string
    highlighted?: string
  }) => api.get('/historical-moments/admin/all', { params }),
  create: (data: any) => api.post('/historical-moments', data),
  update: (id: string, data: any) => api.put(`/historical-moments/${id}`, data),
  delete: (id: string) => api.delete(`/historical-moments/${id}`),
  toggleHighlight: (id: string) => api.patch(`/historical-moments/${id}/toggle-highlight`),
}

// Upload API
export const uploadApi = {
  single: (file: File, folder?: string) => {
    const formData = new FormData()
    formData.append('file', file)
    if (folder) formData.append('folder', folder)
    return api.post('/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  multiple: (files: File[], folder?: string) => {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    if (folder) formData.append('folder', folder)
    return api.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  uploadSingle: (formData: FormData) => {
    return api.post('/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }
}

// Slider API
export const sliderApi = {
  // Get active slider images (public)
  getActive: () => api.get('/slider/active'),
  
  // Admin endpoints
  getAll: (params?: any) => api.get('/slider', { params }),
  getById: (id: string) => api.get(`/slider/${id}`),
  create: (data: any) => api.post('/slider', data),
  update: (id: string, data: any) => api.put(`/slider/${id}`, data),
  delete: (id: string) => api.delete(`/slider/${id}`),
  toggle: (id: string) => api.put(`/slider/${id}/toggle`),
  updateOrder: (slides: any[]) => api.put('/slider/order/update', { slides })
}

// Blood Donation API
export const bloodDonationApi = {
  // Public routes
  getAllDonors: (params?: {
    bloodGroup?: string
    available?: string
    page?: number
    limit?: number
  }) => api.get('/blood-donation/donors', { params }),
  
  getAvailableDonorsByBloodGroup: (bloodGroup: string) => 
    api.get(`/blood-donation/donors/available/${bloodGroup}`),
  
  // Protected routes
  getMyBloodInfo: () => api.get('/blood-donation/my-info'),
  
  updateBloodInfo: (data: {
    bloodGroup?: string
    contactNumber?: string
  }) => api.put('/blood-donation/update-info', data),
  
  recordDonation: (data: {
    donationDate?: string
  }) => api.post('/blood-donation/record-donation', data),
  
  // Admin routes
  adminUpdateBloodInfo: (userId: string, data: {
    bloodGroup?: string
    contactNumber?: string
    lastDonationDate?: string
  }) => api.put(`/blood-donation/admin/users/${userId}`, data),
}

export default api 