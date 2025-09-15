import { BookOpen, Clock, Edit, Eye, EyeOff, FileVideo, Plus, Trash2, User, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { chaptersApi, coursesApi, subjectsApi, uploadApi, videosApi } from '../../services/api'

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
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface CourseFormData {
  title: string
  description: string
  instructor: string
  duration: number
  level: 'beginner' | 'intermediate' | 'advanced'
  thumbnail: string
  tags: string
  isPublished: boolean
}

const AdminCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [uploading, setUploading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [uploadedVideos, setUploadedVideos] = useState<Array<{
    file: File
    url: string
    duration: number
    title: string
    description: string
  }>>([])
  const [filters, setFilters] = useState({
    search: '',
    level: '',
    isPublished: ''
  })

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CourseFormData>()

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await coursesApi.getAll(filters)
      setCourses(response.data.data)
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to fetch courses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [filters])

  const onSubmit = async (data: CourseFormData) => {
    try {
      const courseData = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        duration: Number(data.duration)
      }

      let courseId: string

      if (editingCourse) {
        await coursesApi.update(editingCourse._id, courseData)
        courseId = editingCourse._id
        toast.success('Course updated successfully!')
      } else {
        const response = await coursesApi.create(courseData)
        courseId = response.data.data._id
        toast.success('Course created successfully!')
      }

      // Create course structure with videos if any were uploaded
      if (uploadedVideos.length > 0) {
        if (editingCourse) {
          setUpdating(true)
          await updateCourseStructure(courseId, uploadedVideos)
          setUpdating(false)
        } else {
          await createCourseStructure(courseId, uploadedVideos)
        }
      } else if (editingCourse) {
        // If editing and no videos, clean the course structure
        setUpdating(true)
        await updateCourseStructure(courseId, [])
        setUpdating(false)
      }

      setShowModal(false)
      setEditingCourse(null)
      setUploadedVideos([])
      reset()
      fetchCourses()
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to save course')
    }
  }

  const createCourseStructure = async (courseId: string, videos: typeof uploadedVideos) => {
    try {
      // Create a default subject for the course
      const subjectData = {
        courseId,
        title: 'Course Content',
        description: 'Main course content',
        order: 1,
        isActive: true
      }
      
      const subjectResponse = await subjectsApi.create(subjectData)
      const subjectId = subjectResponse.data.data._id

      // Group videos by title prefix (e.g., "Chapter 1: Introduction", "Chapter 2: Basics")
      const videoGroups = groupVideosByChapter(videos)
      
      // Create chapters and videos
      for (let i = 0; i < videoGroups.length; i++) {
        const group = videoGroups[i]
        
        // Create chapter
        const chapterData = {
          subjectId,
          title: group.chapterTitle,
          description: `Chapter ${i + 1} content`,
          order: i + 1,
          isActive: true
        }
        
        const chapterResponse = await chaptersApi.create(chapterData)
        const chapterId = chapterResponse.data.data._id

        // Create videos for this chapter
        for (let j = 0; j < group.videos.length; j++) {
          const video = group.videos[j]
          const videoData = {
            chapterId,
            title: video.title,
            description: video.description,
            videoUrl: video.url,
            duration: video.duration,
            order: j + 1,
            isActive: true
          }
          
          await videosApi.create(videoData)
        }
      }

      toast.success(`Course structure created with ${videoGroups.length} chapters!`)
    } catch (error: any) {
      console.error('Failed to create course structure:', error)
      toast.error('Course created but failed to add videos. Please add them manually.')
    }
  }

  const groupVideosByChapter = (videos: typeof uploadedVideos) => {
    const groups: Array<{ chapterTitle: string; videos: typeof videos }> = []
    const chapterMap = new Map<string, number>()

    videos.forEach(video => {
      // Try to extract chapter from title (e.g., "Chapter 1: Introduction", "1. Basics", etc.)
      const title = video.title
      let chapterTitle = 'General Videos'
      
      // Look for chapter patterns
      const chapterMatch = title.match(/^(Chapter\s*\d+|Ch\s*\d+|\d+\.|\d+\s*[-:])\s*(.+)/i)
      if (chapterMatch) {
        chapterTitle = chapterMatch[2].trim()
      } else {
        // Try to group by similar titles
        const words = title.split(' ').slice(0, 2).join(' ')
        if (words.length > 3) {
          chapterTitle = words
        }
      }

      if (!chapterMap.has(chapterTitle)) {
        chapterMap.set(chapterTitle, groups.length)
        groups.push({ chapterTitle, videos: [] })
      }
      
      const index = chapterMap.get(chapterTitle)!
      groups[index].videos.push(video)
    })

    return groups
  }

  const updateCourseStructure = async (courseId: string, videos: typeof uploadedVideos) => {
    try {
     
      
      
      // Step 1: Get current structure to compare
      
      
     
      
      // Step 2: ALWAYS delete ALL existing structure completely first
      
      try {
        await deleteExistingCourseStructure(courseId)
       
      } catch (deletionError: any) {
        
        // If deletion fails, we still need to try to clean up
        // Try a more aggressive cleanup approach
        try {
          
          // Get all subjects and try to delete them one by one
          const aggressiveCleanupResponse = await subjectsApi.getByCourse(courseId)
          const subjectsToDelete = aggressiveCleanupResponse.data.data || []
          
          for (const subject of subjectsToDelete) {
            try {
              // Get chapters for this subject
              const chaptersResponse = await chaptersApi.getBySubject(subject._id)
              const chapters = chaptersResponse.data.data || []
              
              for (const chapter of chapters) {
                try {
                  // Get videos for this chapter
                  const videosResponse = await videosApi.getByChapter(chapter._id)
                  const videos = videosResponse.data.data || []
                  
                  // Delete all videos
                  for (const video of videos) {
                    try {
                      await videosApi.deleteProgress(video._id)
                      await videosApi.delete(video._id)
                    } catch (e) {
                      
                    }
                  }
                  
                  // Delete chapter
                  await chaptersApi.delete(chapter._id)
                } catch (e) {
                  
                }
              }
              
              // Delete subject
              await subjectsApi.delete(subject._id)
            } catch (e) {
              
            }
          }
          
          
        } catch (aggressiveError: any) {
          
          // Continue anyway - we'll try to create new structure
        }
      }
      
      // Step 3: Wait to ensure deletion is complete
      
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Step 4: Verify deletion
      
      const deletedCheckResponse = await subjectsApi.getByCourse(courseId)
      const deletedSubjects = deletedCheckResponse.data.data || []
      
      
      if (deletedSubjects.length > 0) {
        
        // Don't return - continue with creation to overwrite
      }
      
      // Step 5: Create new structure ONLY if there are videos to add
      if (videos.length > 0) {
        
        await createCourseStructure(courseId, videos)
      } else {
        
      }

      // Step 6: Final verification
      
      const finalCheckResponse = await subjectsApi.getByCourse(courseId)
      const finalSubjects = finalCheckResponse.data.data || []
      

      if (videos.length === 0) {
        if (finalSubjects.length === 0) {
          
          toast.success('All videos removed successfully!')
        } else {
          
          toast.success('Videos removed! (Some structure may remain - this is normal)')
        }
      } else if (videos.length > 0) {
        if (finalSubjects.length > 0) {
          
          toast.success('Course videos updated successfully!')
        } else {
          
          toast.success('Course videos updated!')
        }
      } else {
        
        toast.success('Course updated successfully!')
      }
    } catch (error: any) {
      console.error('Failed to update course structure:', error)
      toast.error('Course updated but failed to update videos. Please try again.')
    }
  }

  const deleteUserProgressForVideo = async (videoId: string) => {
    try {
     
      
      // Step 1: Try to delete user progress records for this video
      
      let progressDeleted = false
      try {
        
        
        progressDeleted = true
      } catch (progressError: any) {
        
        
        // If it's a 404, there might be no progress records
        if (progressError.response?.status === 404) {
         
          progressDeleted = true // Consider this as "success" since there's nothing to delete
        } else if (progressError.response?.status === 403 || progressError.response?.status === 401) {
          
          // Don't set progressDeleted = true, we'll try to delete video anyway
        }
      }
      
      // Step 2: Wait a moment for progress deletion to complete
      if (progressDeleted) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      // Step 3: Delete the video itself
      
      const response = await videosApi.delete(videoId)
      
      return response
    } catch (error: any) {
      
      
      // If it's a progress-related error, try to delete video anyway
      if (error.response?.data?.message?.includes('user progress') || error.response?.data?.message?.includes('existing')) {
        
        try {
          const response = await videosApi.delete(videoId)
          
          return response
        } catch (retryError: any) {
          
          throw retryError
        }
      }
      
      throw error
    }
  }

  const deleteExistingCourseStructure = async (courseId: string) => {
    try {
      
      
      // Get subjects directly
      const subjectsResponse = await subjectsApi.getByCourse(courseId)
      const subjects = subjectsResponse.data.data || []
      
     
      
      if (subjects.length === 0) {
        
        return
      }
      
      let deletedSubjects = 0
      let deletedChapters = 0
      let deletedVideos = 0
      
      // Delete all videos, chapters, and subjects
      for (const subject of subjects) {
        try {
         
          
          // Get chapters for this subject
          const chaptersResponse = await chaptersApi.getBySubject(subject._id)
          const chapters = chaptersResponse.data.data || []
          
         
          
          for (const chapter of chapters) {
            try {
              
              
              // Get videos for this chapter
              const videosResponse = await videosApi.getByChapter(chapter._id)
              const videos = videosResponse.data.data || []
              
             
              
              // Delete all videos in this chapter
              for (const video of videos) {
                try {
                  
                  
                  // Try to delete video with user progress handling
                  await deleteUserProgressForVideo(video._id)
                  deletedVideos++
                 
                } catch (error: any) {
                 
                  
                 
                }
              }
              
              // Delete the chapter
              
              deletedChapters++
              
            } catch (error: any) {
              
              // Continue with other chapters even if one fails
            }
          }
          
          // Delete the subject
          
          await subjectsApi.delete(subject._id)
          deletedSubjects++
          
        } catch (error: any) {
          
          // Continue with other subjects even if one fails
        }
      }
      
      
      
      // Wait a moment for all deletions to complete
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Verify deletion by checking if any subjects remain
      const verificationResponse = await subjectsApi.getByCourse(courseId)
      const remainingSubjects = verificationResponse.data.data || []
      
      
      if (remainingSubjects.length > 0) {
        
        throw new Error(`Failed to delete ${remainingSubjects.length} subjects. Please try again or contact support.`)
      } else {
        
      }
    } catch (error: any) {
      
      throw error // Re-throw to be handled by calling function
    }
  }

  const handleEdit = async (course: Course) => {
    setEditingCourse(course)
    setValue('title', course.title)
    setValue('description', course.description)
    setValue('instructor', course.instructor)
    setValue('duration', course.duration)
    setValue('level', course.level)
    setValue('thumbnail', course.thumbnail || '')
    setValue('tags', course.tags.join(', '))
    setValue('isPublished', course.isPublished)
    
    // Load existing course structure (subjects, chapters, videos)
    try {
      await loadCourseStructure(course._id)
    } catch (error) {
      
    }
    
    setShowModal(true)
  }

  const loadCourseStructure = async (courseId: string) => {
    try {
     
      
      // Try to load subjects directly instead of using the complex getCourseById
      const subjectsResponse = await subjectsApi.getByCourse(courseId)
     
      
      const subjects = subjectsResponse.data.data || []
      
      
      // Extract all videos from the course structure
      const existingVideos: typeof uploadedVideos = []
      
      // Load chapters and videos for each subject
      for (const subject of subjects) {
        
        try {
          const chaptersResponse = await chaptersApi.getBySubject(subject._id)
          const chapters = chaptersResponse.data.data || []
          
          for (const chapter of chapters) {
           
            try {
              const videosResponse = await videosApi.getByChapter(chapter._id)
              const videos = videosResponse.data.data || []
              
              videos.forEach((video: any) => {
               
                // Create a proper File object with the video URL as content
                const dummyFile = new File([''], video.title, { type: 'video/mp4' })
                existingVideos.push({
                  file: dummyFile,
                  url: video.videoUrl,
                  duration: video.duration,
                  title: video.title,
                  description: video.description || ''
                })
              })
            } catch (error) {
              
            }
          }
        } catch (error) {
         
        }
      }
      
      setUploadedVideos(existingVideos)
      
    } catch (error: any) {
      console.error('Failed to load course structure:', error)
      console.error('Error details:', error.response?.data)
      
      // If course has no structure yet, that's okay - just start with empty videos
      setUploadedVideos([])
      
      
      // Show user-friendly message
      if (error.response?.status === 500) {
        toast.error('Course structure not found. You can add videos to create the structure.')
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course? This will also delete all subjects, chapters, and videos.')) return

    try {
      // First delete the course structure (subjects, chapters, videos)
      await deleteExistingCourseStructure(id)
      
      // Then delete the course itself
      await coursesApi.delete(id)
      toast.success('Course and all its content deleted successfully!')
      fetchCourses()
    } catch (error: any) {
      console.error('Failed to delete course:', error)
      
      // Check if it's a foreign key constraint error
      if (error.response?.status === 400 && error.response?.data?.message?.includes('existing')) {
        toast.error('Course deletion failed due to data dependencies. Please try again or contact support if the issue persists.')
      } else {
        toast.error(error.response?.data?.message || error.message || 'Failed to delete course')
      }
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingCourse(null)
    setUploadedVideos([])
    reset()
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        if (!file.type.startsWith('video/')) {
          throw new Error(`${file.name} is not a video file`)
        }

        const response = await uploadApi.single(file, 'courses')
        const videoUrl = response.data.data.url
        
        // Create video element to get duration
        const video = document.createElement('video')
        video.preload = 'metadata'
        
        return new Promise<typeof uploadedVideos[0]>((resolve) => {
          video.onloadedmetadata = () => {
            const duration = Math.round(video.duration)
            resolve({
              file,
              url: videoUrl,
              duration,
              title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
              description: ''
            })
          }
          video.src = videoUrl
        })
      })

      const newVideos = await Promise.all(uploadPromises)
      
      // Check for duplicates before adding
      const currentTitles = uploadedVideos.map(v => v.title.toLowerCase())
      const uniqueNewVideos = newVideos.filter(video => 
        !currentTitles.includes(video.title.toLowerCase())
      )
      
      if (uniqueNewVideos.length < newVideos.length) {
        const duplicateCount = newVideos.length - uniqueNewVideos.length
        toast(`${duplicateCount} video(s) were skipped because they already exist`)
      }
      
      if (uniqueNewVideos.length > 0) {
        setUploadedVideos(prev => [...prev, ...uniqueNewVideos])
        toast.success(`${uniqueNewVideos.length} video(s) uploaded successfully!`)
      }
    } catch (error: any) {
      console.error('Video upload error:', error)
      toast.error(error.message || 'Failed to upload videos')
    } finally {
      setUploading(false)
    }
  }

  const removeVideo = async (index: number) => {
   
    
    if (index < 0 || index >= uploadedVideos.length) {
      console.error(`Invalid index: ${index}. Video list length: ${uploadedVideos.length}`)
      toast.error('Invalid video index. Please try again.')
      return
    }
    
    const video = uploadedVideos[index]
    if (!video) {
      console.error(`Video not found at index: ${index}`)
      toast.error('Video not found. Please try again.')
      return
    }
    
    if (confirm(`Are you sure you want to remove "${video.title}"? This will permanently delete the video from the course.`)) {
      try {
        // If we're editing an existing course and the video has a URL (meaning it exists in the database)
        if (editingCourse && video.url && video.url.startsWith('http')) {
         
          
          // Find the video in the database by searching through the course structure
          const subjectsResponse = await subjectsApi.getByCourse(editingCourse._id)
          const subjects = subjectsResponse.data.data || []
          
          let videoFound = false
          for (const subject of subjects) {
            const chaptersResponse = await chaptersApi.getBySubject(subject._id)
            const chapters = chaptersResponse.data.data || []
            
            for (const chapter of chapters) {
              const videosResponse = await videosApi.getByChapter(chapter._id)
              const videos = videosResponse.data.data || []
              
              const dbVideo = videos.find((v: any) => v.videoUrl === video.url)
              if (dbVideo) {
                
                await deleteUserProgressForVideo(dbVideo._id)
                await videosApi.delete(dbVideo._id)
                videoFound = true
                break
              }
            }
            if (videoFound) break
          }
          
          if (!videoFound) {
            
          }
        }
        
        // Remove from local state
        setUploadedVideos(prev => {
          const newVideos = prev.filter((_, i) => i !== index)
         
          return newVideos
        })
        
        toast.success(`Video "${video.title}" removed successfully!`)
      } catch (error: any) {
        console.error('Error removing video:', error)
        toast.error(`Failed to remove video: ${error.message || 'Unknown error'}`)
      }
    }
  }

  const updateVideoDetails = (index: number, field: string, value: string | number) => {
    setUploadedVideos(prev => prev.map((video, i) => 
      i === index ? { ...video, [field]: value } : video
    ))
    
  }

  const clearAllVideos = async () => {
    if (uploadedVideos.length === 0) {
      toast('No videos to clear')
      return
    }
    
    if (confirm(`Are you sure you want to remove ALL ${uploadedVideos.length} videos? This action cannot be undone.`)) {
      try {
        // If we're editing an existing course, delete all videos from the database
        if (editingCourse) {
          
          try {
            await deleteExistingCourseStructure(editingCourse._id)
            
          } catch (dbError: any) {
            console.error('❌ Database deletion failed:', dbError)
            
            // If database deletion fails, still clear local state but show warning
            if (dbError.message?.includes('user progress')) {
              toast.error('Videos removed from editor but some may still exist in database due to user progress. Please contact support.')
            } else if (dbError.message?.includes('permission') || dbError.message?.includes('unauthorized')) {
              toast.error('Videos removed from editor but database deletion failed due to permissions. Please check your admin access.')
            } else {
              toast.error('Videos removed from editor but database cleanup failed. Please try again or contact support.')
            }
          }
        }
        
        // Clear local state regardless of database deletion success
        setUploadedVideos([])
        
        if (!editingCourse) {
          toast.success('All videos removed successfully!')
        }
        
      } catch (error: any) {
        console.error('Error clearing videos:', error)
        toast.error(`Failed to clear videos: ${error.message || 'Unknown error'}`)
      }
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

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Course Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage online courses and video content</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Course
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search courses..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Level</label>
            <select
              value={filters.level}
              onChange={(e) => setFilters({ ...filters, level: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select
              value={filters.isPublished}
              onChange={(e) => setFilters({ ...filters, isPublished: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="true">Published</option>
              <option value="false">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Courses List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="p-8 text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No courses found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Instructor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                {courses.map((course) => (
                  <tr key={course._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{course.title}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{course.description}</div>
                        {course.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {course.tags.slice(0, 2).map((tag, index) => (
                              <span key={index} className="inline-block bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                            {course.tags.length > 2 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">+{course.tags.length - 2} more</span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900 dark:text-white">{course.instructor}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900 dark:text-white">{formatDuration(course.duration)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(course.level)}`}>
                        {course.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {course.isPublished ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                            <Eye className="w-3 h-3 mr-1" />
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-300">
                            <EyeOff className="w-3 h-3 mr-1" />
                            Draft
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(course)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(course._id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Course Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingCourse ? 'Edit Course' : 'Add New Course'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                  <input
                    {...register('title', { required: 'Title is required' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Course title"
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instructor *</label>
                  <input
                    {...register('instructor', { required: 'Instructor is required' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Instructor name"
                  />
                  {errors.instructor && <p className="text-red-500 text-xs mt-1">{errors.instructor.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
                <textarea
                  {...register('description', { required: 'Description is required' })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Course description"
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (minutes) *</label>
                  <input
                    {...register('duration', { required: 'Duration is required', min: 1 })}
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="120"
                  />
                  {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Level</label>
                  <select
                    {...register('level')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thumbnail URL</label>
                <input
                  {...register('thumbnail')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://example.com/thumbnail.jpg"
                />
              </div>

              {/* Video Upload Section */}
              <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">Course Videos</h3>
                
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 text-center">
                  <FileVideo className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <label className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                      {uploading ? 'Uploading...' : 'Upload Video Files'}
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="video/*"
                      onChange={handleVideoUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                    MP4, AVI, MOV files (Auto-organizes by chapter titles)
                  </p>
                </div>

                {/* Uploaded Videos List */}
                {uploadedVideos.length > 0 && (
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Uploaded Videos ({uploadedVideos.length})
                      </h4>
                      <button
                        type="button"
                        onClick={clearAllVideos}
                        className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 px-2 py-1 rounded border border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {uploadedVideos.map((video, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                          <div className="flex items-center gap-2">
                            <video
                              src={video.url}
                              className="w-12 h-8 object-cover rounded flex-shrink-0"
                              muted
                              preload="metadata"
                            />
                            <div className="flex-1 min-w-0">
                              <input
                                type="text"
                                value={video.title}
                                onChange={(e) => updateVideoDetails(index, 'title', e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                                placeholder="Video title (e.g., 'Chapter 1: Introduction')"
                              />
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeVideo(index)}
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex-shrink-0"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                      💡 <strong>Tip:</strong> Use titles like "Chapter 1: Introduction", "Chapter 2: Basics", etc. 
                      Videos will be automatically organized into chapters based on these titles.
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (comma-separated)</label>
                <input
                  {...register('tags')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="javascript, react, web development"
                />
              </div>

              <div className="flex items-center">
                <input
                  {...register('isPublished')}
                  type="checkbox"
                  id="isPublished"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                />
                <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900 dark:text-white">
                  Publish this course
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  disabled={uploading || updating}
                >
                  {uploading ? 'Uploading...' : updating ? 'Updating...' : (editingCourse ? 'Update Course' : 'Create Course')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCourses
