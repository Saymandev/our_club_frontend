import { Heart } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import logo from '../../assests/logo.jpg'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const { t } = useTranslation()

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Club Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img src={logo} alt="logo" className="w-8 h-8 rounded-lg" />
              <span className="font-heading font-bold text-xl text-gray-900 dark:text-white">
                {t('footer.clubName')}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors duration-200"
                >
                  {t('common.home')}
                </Link>
              </li>
              <li>
                <Link
                  to="/announcements"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors duration-200"
                >
                  {t('common.announcements')}
                </Link>
              </li>
              <li>
                <Link
                  to="/history"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors duration-200"
                >
                  {t('footer.ourHistory')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {t('footer.connectWithUs')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              {t('footer.email')}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              {t('footer.phone')}
            </p>
            <div className="flex space-x-3">
              {/* Social media links would go here */}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {t('footer.copyright', { year: currentYear })}
            </p>
            <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 text-sm mt-2 sm:mt-0">
              <span>{t('common.madeWithLove')}</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>{t('common.forOurCommunity')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 