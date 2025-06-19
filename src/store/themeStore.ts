import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  initializeTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      setTheme: (theme: Theme) => {
        set({ theme })
        // Apply theme to document
        if (theme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },
      toggleTheme: () => {
        const { theme, setTheme } = get()
        setTheme(theme === 'light' ? 'dark' : 'light')
      },
      initializeTheme: () => {
        const { theme } = get()
        
        // Check system preference if no theme is set
        if (!theme) {
          const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          get().setTheme(systemPrefersDark ? 'dark' : 'light')
        } else {
          // Apply the persisted theme
          get().setTheme(theme)
        }
        
        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = (e: MediaQueryListEvent) => {
          // Only update if user hasn't manually set a preference
          if (!localStorage.getItem('theme-storage')) {
            get().setTheme(e.matches ? 'dark' : 'light')
          }
        }
        
        mediaQuery.addEventListener('change', handleChange)
        
        return () => {
          mediaQuery.removeEventListener('change', handleChange)
        }
      }
    }),
    {
      name: 'theme-storage',
      getStorage: () => localStorage,
    }
  )
) 