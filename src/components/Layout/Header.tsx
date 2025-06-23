import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { cn } from '@/utils/cn'
import { ChevronDown, Droplets, Menu, Moon, Settings, Sun, User, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import logo from '../../assests/logo.jpg'
import LanguageSwitcher from '../UI/LanguageSwitcher'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { theme, toggleTheme } = useThemeStore()
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()
  const { t } = useTranslation()

  const navigation = [
    { name: t('common.home'), href: '/' },
    { name: t('common.announcements'), href: '/announcements' },
    { name: t('eventsPage.title'), href: '/events' },
    { name: t('common.history'), href: '/history' },
    { name: t('common.bloodDonors'), href: '/blood-donors' },
    { name: t('common.donations'), href: '/donations' },
  ]

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <img src={logo} alt="logo" className="w-full h-full object-cover rounded-lg" />
              </div>
              <span className="font-heading font-bold text-lg lg:text-xl text-gray-900 dark:text-white hidden sm:block">
                {t('header.clubName')}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Show on extra large screens only due to many nav items */}
          <nav className="hidden xl:flex items-center space-x-3 2xl:space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'px-1 py-2 rounded-md text-sm font-medium transition-colors duration-200 whitespace-nowrap',
                  isActivePath(item.href)
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Language Switcher - Hide on small screens */}
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label={t('header.toggleTheme')}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>

            {/* User Menu - Only show on larger screens */}
            {isAuthenticated && user ? (
              <div className="relative hidden lg:block">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-1 xl:space-x-2 px-2 xl:px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 rounded-lg"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden xl:inline max-w-20 truncate">{user.username}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                    <Link
                      to="/my-blood-donation"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Droplets className="w-4 h-4 mr-3" />
                      {t('bloodDonation.myProfile')}
                    </Link>
                    <Link
                      to="/admin"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Admin Panel
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="btn-primary text-sm px-3 py-2 hidden lg:block"
              >
                {t('common.login')}
              </Link>
            )}

            {/* Mobile menu button - Show on tablets and mobile */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="xl:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label={t('header.toggleMenu')}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation - Show on tablets and mobile */}
        {isMenuOpen && (
          <div className="xl:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <nav className="flex flex-col space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    'px-3 py-3 rounded-md text-base font-medium transition-colors duration-200',
                    isActivePath(item.href)
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                      : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  )}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile-only items */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 mt-3">
                {/* Language Switcher for mobile */}
                <div className="px-3 py-2 md:hidden">
                  <LanguageSwitcher />
                </div>
                
                {/* User menu items for mobile when authenticated */}
                {isAuthenticated && user ? (
                  <>
                    <div className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 mb-2">
                      {user.username}
                    </div>
                    <Link
                      to="/my-blood-donation"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center px-3 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
                    >
                      <Droplets className="w-5 h-5 mr-3" />
                      {t('bloodDonation.myProfile')}
                    </Link>
                    <Link
                      to="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center px-3 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
                    >
                      <Settings className="w-5 h-5 mr-3" />
                      Admin Panel
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-3 text-base font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md"
                  >
                    {t('common.login')}
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header 