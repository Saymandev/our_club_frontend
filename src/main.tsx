import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from 'react-query'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './i18n/config'
import './index.css'
import { useLanguageStore } from './store/languageStore'

// Initialize language store
useLanguageStore.getState().initializeLanguage()

// Create a client for React Query with offline support
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, _error: any) => {
        // Don't retry if offline
        if (!navigator.onLine) return false
        // Retry up to 3 times for network errors
        return failureCount < 3
      },
      staleTime: 10 * 60 * 1000, // 10 minutes - data stays fresh longer
      cacheTime: 24 * 60 * 60 * 1000, // 24 hours - keep in cache longer
      // Keep previous data when refetching
      keepPreviousData: true,
      // Don't show errors when offline, use cached data instead
      useErrorBoundary: false,
    },
    mutations: {
      retry: (failureCount, _error: any) => {
        if (!navigator.onLine) return false
        return failureCount < 2
      },
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            className: 'dark:bg-gray-800 dark:text-white',
            style: {
              background: 'var(--toast-bg)',
              color: 'var(--toast-color)',
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
) 