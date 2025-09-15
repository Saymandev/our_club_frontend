import { BookOpen, CheckCircle, ChevronRight, Clock, Play, User } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { chaptersApi, coursesApi, subjectsApi, videosApi } from '../services/api'

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
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set())
  const [lastProgressUpdate, setLastProgressUpdate] = useState<number>(0)

  const fetchCourseDetails = async () => {
    try {
      setLoading(true)
      
      // Try to get basic course info - if this fails, try alternative approach
      let courseData = null
      try {
        const courseResponse = await coursesApi.getById(id!)
        courseData = courseResponse.data.data.course
        setCourse(courseData)
        console.log('Course loaded successfully:', courseData.title)
      } catch (error) {
        console.log('Failed to load course with getById, trying alternative approach')
        // Try to get course from the list of all courses
        try {
          const allCoursesResponse = await coursesApi.getAll({ isPublished: 'true' })
          const allCourses = allCoursesResponse.data.data
          courseData = allCourses.find((c: any) => c._id === id)
          
          if (courseData) {
            setCourse(courseData)
            console.log('Course found in all courses:', courseData.title)
          } else {
            console.log('Course not found in all courses either')
            return // Course not found, will show error message
          }
        } catch (listError) {
          console.log('Failed to load course from all courses:', listError)
          return // Both methods failed
        }
      }
      
      // Load course structure separately to avoid 500 errors
      const subjectsWithStructure = await loadCourseStructure(id!)
      setSubjects(subjectsWithStructure)
      
      // Auto-expand first subject
      if (subjectsWithStructure.length > 0) {
        setExpandedSubjects(new Set([subjectsWithStructure[0]._id]))
      }
    } catch (error: any) {
      console.error('Failed to fetch course details:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCourseStructure = async (courseId: string) => {
    try {
      console.log('Loading course structure for:', courseId)
      
      // Get subjects for the course
      const subjectsResponse = await subjectsApi.getByCourse(courseId)
      const subjects = subjectsResponse.data.data || []
      
      console.log('Subjects found:', subjects.length)
      
      // If no subjects found, that's okay - course might not have structure yet
      if (subjects.length === 0) {
        console.log('No subjects found for course - this is normal for new courses')
        return []
      }
      
      // Load chapters and videos for each subject
      const subjectsWithStructure = []
      
      for (const subject of subjects) {
        console.log(`Loading chapters for subject:`, subject.title)
        try {
          const chaptersResponse = await chaptersApi.getBySubject(subject._id)
          const chapters = chaptersResponse.data.data || []
          
          const chaptersWithVideos = []
          
          for (const chapter of chapters) {
            console.log(`Loading videos for chapter:`, chapter.title)
            try {
              const videosResponse = await videosApi.getByChapter(chapter._id)
              const videos = videosResponse.data.data || []
              
              // Add videos to chapter
              const chapterWithVideos = {
                ...chapter,
                videos: videos
              }
              chaptersWithVideos.push(chapterWithVideos)
              console.log(`Added ${videos.length} videos to chapter:`, chapter.title)
            } catch (error) {
              console.log(`Error loading videos for chapter ${chapter._id}:`, error)
              // Add chapter without videos
              chaptersWithVideos.push({ ...chapter, videos: [] })
            }
          }
          
          // Add chapters to subject
          const subjectWithChapters = {
            ...subject,
            chapters: chaptersWithVideos
          }
          subjectsWithStructure.push(subjectWithChapters)
          console.log(`Added ${chaptersWithVideos.length} chapters to subject:`, subject.title)
        } catch (error) {
          console.log(`Error loading chapters for subject ${subject._id}:`, error)
          // Add subject without chapters
          subjectsWithStructure.push({ ...subject, chapters: [] })
        }
      }
      
      console.log(`Loaded ${subjectsWithStructure.length} subjects with structure`)
      return subjectsWithStructure
    } catch (error: any) {
      console.error('Failed to load course structure:', error)
      // Return empty array instead of throwing - course might not have structure yet
      return []
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

  const toggleChapter = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters)
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId)
    } else {
      newExpanded.add(chapterId)
    }
    setExpandedChapters(newExpanded)
  }

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video)
  }

  const updateVideoProgress = async (videoId: string, watchedDuration: number) => {
    // Throttle progress updates to once every 5 seconds
    const now = Date.now()
    if (now - lastProgressUpdate < 5000) {
      return
    }
    
    try {
      await videosApi.updateProgress(videoId, { watchedDuration })
      console.log('Video progress updated successfully')
      setLastProgressUpdate(now)
      // Don't refresh entire course data, just log success
    } catch (error) {
      console.error('Failed to update video progress:', error)
      // Don't show error to user, just log it silently
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
      case 'intermediate': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
      case 'advanced': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
      default: return 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-300'
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Course not found</h2>
          <p className="text-gray-600 dark:text-gray-300">The course you're looking for doesn't exist.</p>
          <Link to="/courses" className="mt-4 inline-block text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
            ← Back to Courses
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            {selectedVideo ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
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
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {selectedVideo.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {selectedVideo.description}
                  </p>
                  {selectedVideo.userProgress && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
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
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center mb-6">
                <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Select a video to start learning
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Choose a video from the course content to begin your learning journey.
                </p>
              </div>
            )}

            {/* Course Description */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About this course</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{course.description}</p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Course Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
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
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                    {course.title}
                  </h1>
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(course.level)}`}>
                    {course.level}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <User className="w-4 h-4 mr-2" />
                  <span>{course.instructor}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{Math.floor(course.duration / 60)}h {course.duration % 60}m</span>
                </div>
              </div>

              {course.tags.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-1">
                    {course.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Course Content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">Course Content</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {subjects.length === 0 ? (
                  <div className="p-8 text-center">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Content Available Yet</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      This course doesn't have any videos or content yet. Please check back later.
                    </p>
                  </div>
                ) : (
                  subjects.map((subject: Subject) => (
                  <div key={subject._id} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                    <button
                      onClick={() => toggleSubject(subject._id)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{subject.title}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
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
                      <div className="bg-gray-50 dark:bg-gray-700">
                        {subject.chapters.map((chapter: Chapter) => (
                          <div key={chapter._id} className="border-b border-gray-100 dark:border-gray-600 last:border-b-0">
                            <button
                              onClick={() => toggleChapter(chapter._id)}
                              className="w-full px-6 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-between"
                            >
                              <div>
                                <div className="font-medium text-gray-800 dark:text-gray-200">{chapter.title}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {chapter.videos?.length || 0} videos
                                </div>
                              </div>
                              <ChevronRight
                                className={`w-4 h-4 text-gray-400 transition-transform ${
                                  expandedChapters.has(chapter._id) ? 'rotate-90' : ''
                                }`}
                              />
                            </button>
                            
                            {expandedChapters.has(chapter._id) && chapter.videos && (
                              <div className="bg-white dark:bg-gray-600">
                                {chapter.videos.map((video: Video) => (
                                  <button
                                    key={video._id}
                                    onClick={() => handleVideoSelect(video)}
                                    className={`w-full px-8 py-3 text-left hover:bg-blue-50 dark:hover:bg-gray-500 flex items-center justify-between ${
                                      selectedVideo?._id === video._id ? 'bg-blue-50 dark:bg-gray-500 border-r-2 border-blue-600' : ''
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
                                        <div className="font-medium text-gray-800 dark:text-gray-200">{video.title}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                          {formatDuration(video.duration)}
                                        </div>
                                      </div>
                                    </div>
                                    {video.userProgress && (
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
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
                ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseDetailPage
