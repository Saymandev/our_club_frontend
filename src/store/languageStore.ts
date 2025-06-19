import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import i18n from '../i18n/config'

export type Language = 'en' | 'bn'

interface LanguageState {
  language: Language
  setLanguage: (language: Language) => void
  toggleLanguage: () => void
  initializeLanguage: () => void
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'en',
      setLanguage: (language: Language) => {
        set({ language })
        i18n.changeLanguage(language)
        
        // Update document language attribute
        document.documentElement.lang = language === 'bn' ? 'bn-BD' : 'en-US'
        
        // Update document direction for RTL languages if needed
        document.documentElement.dir = language === 'bn' ? 'ltr' : 'ltr'
      },
      toggleLanguage: () => {
        const { language, setLanguage } = get()
        setLanguage(language === 'en' ? 'bn' : 'en')
      },
      initializeLanguage: () => {
        const { language, setLanguage } = get()
        
        // Apply the persisted language or detect from browser
        if (language) {
          setLanguage(language)
        } else {
          // Detect language from browser or default to English
          const browserLanguage = navigator.language.startsWith('bn') ? 'bn' : 'en'
          setLanguage(browserLanguage as Language)
        }
      }
    }),
    {
      name: 'language-storage',
      getStorage: () => localStorage,
    }
  )
) 