import { BookOpen, CheckCircle, ChevronRight, Clock, Play, User } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { coursesApi, videosApi } from '../services/api'

interface Course {
  _id: string
  title: string
  description: string
  instructor: string
  duration: number
  level: 'beginner' | 'intermediate' | 'advanced'
  thumbnail?: string
  tags: string[]
}

interface Subject {
  _id: string
  title: string
  description: string
  order: number
  chapters?: Chapter[]
}

interface Chapter {
  _id: string
  title: string
  description: string
  order: number
  videos?: Video[]
}

interface Video {
  _id: string
  title: string
  description: string
  videoUrl: string
  duration: number
  order: number
  userProgress?: {
    watchedDuration: number
    completionPercentage: number
    isCompleted: boolean
  }
}

const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [course, setCourse] = useState<Course | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set())

  const fetchCourseDetails = async () => {
    try {
      setLoading(true)
      const response = await coursesApi.getById(id!)
      setCourse(response.data.data.course)
      setSubjects(response.data.data.subjects || [])
      
      // Auto-expand first subject
      if (response.data.data.subjects?.length > 0) {
        setExpandedSubjects(new Set([response.data.data.subjects[0]._id]))
      }
    } catch (error: any) {
      console.error('Failed to fetch course details:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchCourseDetails()
    }
  }, [id])

  const toggleSubject = (subjectId: string) => {
    const newExpanded = new Set(expandedSubjects)
    if (newExpanded.has(subjectId)) {
      newExpanded.delete(subjectId)
    } else {
      newExpanded.add(subjectId)
    }
    setExpandedSubjects(newExpanded)
  }

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video)
  }

  const updateVideoProgress = async (videoId: string, watchedDuration: number) => {
    try {
      await videosApi.updateProgress(videoId, { watchedDuration })
      // Refresh course data to update progress
      fetchCourseDetails()
    } catch (error) {
      console.error('Failed to update video progress:', error)
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Course not found</h2>
          <p className="text-gray-600">The course you're looking for doesn't exist.</p>
          <Link to="/courses" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
            ← Back to Courses
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            {selectedVideo ? (
              <div className="bg-white rounded-lg shadow-sm mb-6">
                <div className="aspect-video bg-black rounded-t-lg">
                  <video
                    key={selectedVideo._id}
                    className="w-full h-full"
                    controls
                    onTimeUpdate={(e) => {
                      const video = e.target as HTMLVideoElement
                      updateVideoProgress(selectedVideo._id, Math.floor(video.currentTime))
                    }}
                  >
                    <source src={selectedVideo.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {selectedVideo.title}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {selectedVideo.description}
                  </p>
                  {selectedVideo.userProgress && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${selectedVideo.userProgress.completionPercentage}%` }}
                        ></div>
                      </div>
                      <span>{selectedVideo.userProgress.completionPercentage}% watched</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center mb-6">
                <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Select a video to start learning
                </h2>
                <p className="text-gray-600">
                  Choose a video from the course content to begin your learning journey.
                </p>
              </div>
            )}

            {/* Course Description */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About this course</h3>
              <p className="text-gray-600 leading-relaxed">{course.description}</p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Course Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                )}
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {course.title}
                  </h1>
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(course.level)}`}>
                    {course.level}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <User className="w-4 h-4 mr-2" />
                  <span>{course.instructor}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{Math.floor(course.duration / 60)}h {course.duration % 60}m</span>
                </div>
              </div>

              {course.tags.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-1">
                    {course.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Course Content */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Course Content</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {subjects.map((subject) => (
                  <div key={subject._id} className="border-b border-gray-100 last:border-b-0">
                    <button
                      onClick={() => toggleSubject(subject._id)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium text-gray-900">{subject.title}</div>
                        <div className="text-sm text-gray-500">
                          {subject.chapters?.length || 0} chapters
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 text-gray-400 transition-transform ${
                          expandedSubjects.has(subject._id) ? 'rotate-90' : ''
                        }`}
                      />
                    </button>
                    
                    {expandedSubjects.has(subject._id) && subject.chapters && (
                      <div className="bg-gray-50">
                        {subject.chapters.map((chapter) => (
                          <div key={chapter._id} className="border-b border-gray-100 last:border-b-0">
                            <button
                              onClick={() => toggleSubject(chapter._id)}
                              className="w-full px-6 py-3 text-left hover:bg-gray-100 flex items-center justify-between"
                            >
                              <div>
                                <div className="font-medium text-gray-800">{chapter.title}</div>
                                <div className="text-sm text-gray-500">
                                  {chapter.videos?.length || 0} videos
                                </div>
                              </div>
                              <ChevronRight
                                className={`w-4 h-4 text-gray-400 transition-transform ${
                                  expandedSubjects.has(chapter._id) ? 'rotate-90' : ''
                                }`}
                              />
                            </button>
                            
                            {expandedSubjects.has(chapter._id) && chapter.videos && (
                              <div className="bg-white">
                                {chapter.videos.map((video) => (
                                  <button
                                    key={video._id}
                                    onClick={() => handleVideoSelect(video)}
                                    className={`w-full px-8 py-3 text-left hover:bg-blue-50 flex items-center justify-between ${
                                      selectedVideo?._id === video._id ? 'bg-blue-50 border-r-2 border-blue-600' : ''
                                    }`}
                                  >
                                    <div className="flex items-center">
                                      <div className="mr-3">
                                        {video.userProgress?.isCompleted ? (
                                          <CheckCircle className="w-4 h-4 text-green-600" />
                                        ) : (
                                          <Play className="w-4 h-4 text-gray-400" />
                                        )}
                                      </div>
                                      <div>
                                        <div className="font-medium text-gray-800">{video.title}</div>
                                        <div className="text-sm text-gray-500">
                                          {formatDuration(video.duration)}
                                        </div>
                                      </div>
                                    </div>
                                    {video.userProgress && (
                                      <div className="text-xs text-gray-500">
                                        {video.userProgress.completionPercentage}%
                                      </div>
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseDetailPage
