import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { cn } from '@/utils/cn'
import { BookOpen, Calendar, ChevronDown, Droplets, FileText, Heart, History, Megaphone, Menu, Moon, Settings, Sun, User, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import logo from '../../assests/logo.jpg'
import LanguageSwitcher from '../UI/LanguageSwitcher'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const { theme, toggleTheme } = useThemeStore()
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()
  const { t } = useTranslation()
  const menuRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const navigation = [
    { name: t('common.home'), href: '/' },
    { 
      name: 'Learning', 
      href: '#',
      dropdown: [
        { name: 'Courses', href: '/courses', icon: BookOpen },
        { name: 'Exams', href: '/exams', icon: FileText },
      ]
    },
    { 
      name: 'Community', 
      href: '#',
      dropdown: [
        { name: t('common.announcements'), href: '/announcements', icon: Megaphone },
        { name: t('eventsPage.title'), href: '/events', icon: Calendar },
        { name: t('common.history'), href: '/history', icon: History },
      ]
    },
    { 
      name: 'Health', 
      href: '#',
      dropdown: [
        { name: t('common.bloodDonors'), href: '/blood-donors', icon: Heart },
        { name: t('common.donations'), href: '/donations', icon: Droplets },
      ]
    },
  ]

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <img src={logo} alt="logo" className="w-full h-full object-cover rounded-lg" />
              </div>
              <span className="font-heading font-bold text-base sm:text-lg lg:text-xl text-gray-900 dark:text-white hidden min-[400px]:block max-w-32 sm:max-w-none truncate">
                {t('header.clubName')}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Show on large screens */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2 2xl:space-x-4" ref={dropdownRef}>
            {navigation.map((item) => (
              <div key={item.name} className="relative">
                {item.dropdown ? (
                  <div className="relative">
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === item.name ? null : item.name)}
                      className={cn(
                        'px-2 py-2 rounded-md text-sm font-medium transition-colors duration-200 whitespace-nowrap flex items-center gap-1',
                        activeDropdown === item.name || item.dropdown?.some(subItem => isActivePath(subItem.href))
                          ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                          : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                      )}
                    >
                      {item.name}
                      <ChevronDown className={cn(
                        'w-3 h-3 transition-transform duration-200',
                        activeDropdown === item.name ? 'rotate-180' : ''
                      )} />
                    </button>
                    
                    {activeDropdown === item.name && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                        {item.dropdown.map((subItem) => {
                          const IconComponent = subItem.icon
                          return (
                            <Link
                              key={subItem.name}
                              to={subItem.href}
                              onClick={() => setActiveDropdown(null)}
                              className={cn(
                                'flex items-center px-4 py-2 text-sm transition-colors duration-200',
                                isActivePath(subItem.href)
                                  ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                                  : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                              )}
                            >
                              <IconComponent className="w-4 h-4 mr-3" />
                              {subItem.name}
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.href}
                    className={cn(
                      'px-2 py-2 rounded-md text-sm font-medium transition-colors duration-200 whitespace-nowrap',
                      isActivePath(item.href)
                        ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                        : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                    )}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
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

            {/* User Menu - Show on medium screens and up */}
            {isAuthenticated && user ? (
              <div className="relative hidden md:block" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-1 lg:space-x-2 px-2 lg:px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 rounded-lg"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden lg:inline max-w-20 truncate">{user.username}</span>
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
                      to="/exam-results"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <FileText className="w-4 h-4 mr-3" />
                      Exam Results
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
                className="btn-primary text-sm px-3 hidden md:block"
              >
                {t('common.login')}
              </Link>
            )}

            {/* Mobile menu button - Show on tablets and mobile */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
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
          <div className="lg:hidden py-4 border-t border-gray-200 dark:border-gray-700" ref={menuRef}>
            <nav className="flex flex-col space-y-1">
              {navigation.map((item) => (
                <div key={item.name}>
                  {item.dropdown ? (
                    <div>
                      <div className="px-3 py-3 text-base font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                        {item.name}
                      </div>
                      <div className="ml-4 space-y-1">
                        {item.dropdown.map((subItem) => {
                          const IconComponent = subItem.icon
                          return (
                            <Link
                              key={subItem.name}
                              to={subItem.href}
                              onClick={() => setIsMenuOpen(false)}
                              className={cn(
                                'flex items-center px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-md',
                                isActivePath(subItem.href)
                                  ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                                  : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                              )}
                            >
                              <IconComponent className="w-4 h-4 mr-3" />
                              {subItem.name}
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        'px-3 py-3 rounded-md text-base font-medium transition-colors duration-200 flex items-center justify-between',
                        isActivePath(item.href)
                          ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                          : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      )}
                    >
                      <span>{item.name}</span>
                      {isActivePath(item.href) && (
                        <div className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full"></div>
                      )}
                    </Link>
                  )}
                </div>
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
                      to="/exam-results"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center px-3 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
                    >
                      <FileText className="w-5 h-5 mr-3" />
                      Exam Results
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