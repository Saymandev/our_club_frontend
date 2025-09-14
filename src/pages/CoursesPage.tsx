import { BookOpen, Clock, Play, User } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { coursesApi } from '../services/api'

interface Course {
  _id: string
  title: string
  description: string
  instructor: string
  duration: number
  level: 'beginner' | 'intermediate' | 'advanced'
  thumbnail?: string
  tags: string[]
  isPublished: boolean
  createdAt: string
}

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    level: '',
    search: ''
  })

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await coursesApi.getAll({ 
        isPublished: 'true',
        ...filters 
      })
      setCourses(response.data.data)
    } catch (error: any) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [filters])

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Online Courses
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Learn new skills with our comprehensive video courses. 
            From beginner to advanced levels, we have something for everyone.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Courses
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search by title, instructor, or description..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Level
              </label>
              <select
                value={filters.level}
                onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600">
              {filters.search || filters.level 
                ? 'Try adjusting your search criteria.' 
                : 'No courses are available at the moment.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                {/* Course Thumbnail */}
                <div className="relative">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 rounded-t-lg flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-white" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(course.level)}`}>
                      {course.level}
                    </span>
                  </div>
                </div>

                {/* Course Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {course.description}
                  </p>

                  {/* Course Meta */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="w-4 h-4 mr-2" />
                      <span>{course.instructor}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{formatDuration(course.duration)}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {course.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {course.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {course.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{course.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Action Button */}
                  <Link
                    to={`/courses/${course._id}`}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Start Learning
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Course Stats */}
        {!loading && courses.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {courses.length}
                </div>
                <div className="text-gray-600">Total Courses</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {courses.filter(c => c.level === 'beginner').length}
                </div>
                <div className="text-gray-600">Beginner Courses</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {Math.round(courses.reduce((sum, c) => sum + c.duration, 0) / courses.length)}m
                </div>
                <div className="text-gray-600">Average Duration</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CoursesPage
