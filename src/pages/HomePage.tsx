import { Skeleton } from '@/components/UI/Skeleton';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sliderApi } from '../services/api';

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  // Fallback slides if API fails
  const fallbackSlides = [
    {
      id: 1,
      title: t('slider.defaultTitle'),
      description: t('slider.defaultDescription'),
      imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=400&fit=crop'
    },
    {
      id: 2,
      title: t('slider.communityTitle'),
      description: t('slider.communityDescription'),
      imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&h=400&fit=crop'
    }
  ];

  // Fetch slider images from API
  const fetchSliderImages = async () => {
    try {
      setIsLoading(true);
      const response = await sliderApi.getActive();
      
      if (response.data.success && response.data.data.length > 0) {
        setSlides(response.data.data);
      } else {
        // Fallback slides if no API data
        setSlides(fallbackSlides);
      }
    } catch (error) {
      console.error('Error fetching slider images:', error);
      // Fallback slides
      setSlides(fallbackSlides);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSliderImages();
  }, []);

  // Auto-play slideshow
  useEffect(() => {
    if (slides.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);

      return () => clearInterval(timer);
    }
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        {/* Hero Section Skeleton */}
        <section className="relative h-screen overflow-hidden">
          <Skeleton className="absolute inset-0 w-full h-full" />
          <div className="absolute inset-0 bg-black/20">
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4 max-w-2xl mx-auto px-4">
                <Skeleton className="h-8 w-64 mx-auto" />
                <Skeleton className="h-4 w-96 mx-auto" />
                <Skeleton className="h-12 w-32 mx-auto" />
              </div>
            </div>
          </div>
        </section>

        {/* About Section Skeleton */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Skeleton className="h-10 w-64 mx-auto mb-6" />
              <Skeleton className="h-4 w-96 mx-auto" />
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="text-center p-8 rounded-lg bg-white dark:bg-gray-800 shadow-lg"
                >
                  <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
                  <Skeleton className="h-6 w-32 mx-auto mb-4" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4 mx-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  const features = [
    {
      title: t('homepage.features.community.title'),
      description: t('homepage.features.community.description'),
      icon: '🤝'
    },
    {
      title: t('homepage.features.events.title'),
      description: t('homepage.features.events.description'),
      icon: '🎉'
    },
    {
      title: t('homepage.features.growth.title'),
      description: t('homepage.features.growth.description'),
      icon: '🌱'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Slider Images */}
      <section className="relative h-screen overflow-hidden">
        <div className="absolute inset-0">
          {slides.map((slide, index) => (
            <motion.div
              key={slide._id || slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 10 }}
            >
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className="w-full h-full object-cover object-center"
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center center',
                  minHeight: '100vh',
                  width: '100%',
                  height: '100%'
                }}
                loading="eager"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=400&fit=crop';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/70" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </motion.div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Slide Indicators */}
        {slides.length > 1 && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'bg-white scale-125'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        )}
      </section>

      {/* About Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 dark:text-white">
              {t('homepage.aboutTitle')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t('homepage.aboutDescription')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center p-8 rounded-lg bg-white dark:bg-gray-800 shadow-lg"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold mb-4 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 