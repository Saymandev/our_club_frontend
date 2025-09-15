import { AdminHistoricalMomentsSkeleton } from '@/components/UI/Skeleton'
import { historicalMomentsApi, uploadApi } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { motion } from 'framer-motion'
import { Calendar, Camera, Edit, Image as ImageIcon, Plus, Search, Star, StarOff, Trash2, Upload, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

interface HistoricalMoment {
  _id: string
  title: string
  description: string
  date: string
  mediaType: 'image' | 'video'
  mediaUrl: string
  publicId: string
  thumbnailUrl?: string
  mediaFiles?: Array<{
    mediaType: 'image' | 'video'
    mediaUrl: string
    publicId: string
    thumbnailUrl?: string
  }>
  tags: string[]
  isHighlighted: boolean
  views: number
  likes: number
  createdAt: string
  updatedAt: string
}

interface HistoricalMomentForm {
  title: string
  description: string
  date: string
  tags: string
  isHighlighted: boolean
}

interface MediaFile {
  mediaType: 'image' | 'video'
  mediaUrl: string
  publicId: string
  thumbnailUrl?: string
}

const AdminHistoricalMoments = () => {
  const { user } = useAuthStore()
  const [moments, setMoments] = useState<HistoricalMoment[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingMoment, setEditingMoment] = useState<HistoricalMoment | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [mediaFilter, setMediaFilter] = useState('all')
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<MediaFile[]>([])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<HistoricalMomentForm>()

  const fetchMoments = async () => {
    try {
      setLoading(true)
      const response = await historicalMomentsApi.getAllAdmin({
        limit: 50,
        mediaType: mediaFilter === 'all' ? undefined : mediaFilter
      })
      setMoments(response.data.data)
    } catch (error) {
      toast.error('Failed to fetch historical moments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMoments()
  }, [mediaFilter])

  const handleMultipleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    // Validate all files first
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const isImage = file.type.startsWith('image/')
      const isVideo = file.type.startsWith('video/')
      
      if (!isImage && !isVideo) {
        toast.error(`File ${file.name} is not a valid image or video file`)
        return
      }

      if (file.size > 50 * 1024 * 1024) {
        toast.error(`File ${file.name} size must be less than 50MB`)
        return
      }
    }

    // Check if there are video files and warn about longer upload time
    const hasVideos = Array.from(files).some(file => file.type.startsWith('video/'))
    if (hasVideos) {
      toast.loading('Video files detected. Upload may take longer...', { duration: 3000 })
    }

    try {
      setUploading(true)
      const uploadPromises = []
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        uploadPromises.push(uploadApi.single(file, 'historical-moments'))
      }

      const responses = await Promise.all(uploadPromises)
      
      // Debug log the responses
     
      
      const newFiles: MediaFile[] = responses.map((response, index) => {
        
        
        // Validate response structure
        if (!response.data || !response.data.data) {
          throw new Error(`Invalid response structure for file ${index + 1}`)
        }
        
        const data = response.data.data
        
        // Validate required fields
        if (!data.url || !data.publicId) {
          throw new Error(`Missing required fields in response for file ${index + 1}`)
        }
        
        // Determine media type - fallback to file type if resourceType is missing
        let mediaType = data.resourceType
        if (!mediaType) {
          const file = files[index]
          mediaType = file.type.startsWith('video/') ? 'video' : 'image'
        }
        
        return {
          mediaType: mediaType as 'image' | 'video',
          mediaUrl: data.url,
          publicId: data.publicId,
          thumbnailUrl: data.thumbnailUrl || data.url
        }
      })

      setUploadedFiles(prev => [...prev, ...newFiles])
      toast.success(`${files.length} file(s) uploaded successfully!`)
      
      // Clear the input value to allow re-uploading the same files
      if (event.target) {
        event.target.value = ''
      }
    } catch (error: any) {
      console.error('Upload error details:', error)
      
      // More detailed error messaging with specific handling for different error types
      let errorMessage = 'Failed to upload files'
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = 'Upload timed out. This can happen with large video files. Please try uploading smaller files or check your internet connection.'
      } else if (error.response?.status === 413) {
        errorMessage = 'File too large. Please reduce file size and try again.'
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error during upload. Please try again later.'
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      toast.error(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleCreateOrUpdate = async (data: HistoricalMomentForm) => {
    if (!editingMoment && uploadedFiles.length === 0) {
      toast.error('Please upload at least one media file')
      return
    }

    try {
      let payload: any = {
        ...data,
        tags: data.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      }

      if (editingMoment) {
        // When editing, preserve existing media and add new files
        payload.mediaType = editingMoment.mediaType
        payload.mediaUrl = editingMoment.mediaUrl
        payload.publicId = editingMoment.publicId
        payload.thumbnailUrl = editingMoment.thumbnailUrl
        
        // Combine existing mediaFiles with new uploaded files
        const existingMediaFiles = editingMoment.mediaFiles || []
        const newMediaFiles = uploadedFiles || []
        payload.mediaFiles = [...existingMediaFiles, ...newMediaFiles]
        
        
      } else {
        // When creating new moment
        if (uploadedFiles.length > 0) {
          // Validate first file
          const firstFile = uploadedFiles[0]
          if (!firstFile.mediaType || !firstFile.mediaUrl || !firstFile.publicId) {
            throw new Error('Invalid file data: missing required fields')
          }
          
          // First file as main media
          payload.mediaType = firstFile.mediaType
          payload.mediaUrl = firstFile.mediaUrl
          payload.publicId = firstFile.publicId
          payload.thumbnailUrl = firstFile.thumbnailUrl
          
          // Additional files in mediaFiles array
          const additionalFiles = uploadedFiles.length > 1 ? uploadedFiles.slice(1) : []
          payload.mediaFiles = additionalFiles
          
          
        } else {
          throw new Error('No files were uploaded')
        }
      }

      // Validate payload before sending
      if (!payload.title || !payload.description || !payload.date) {
        throw new Error('Missing required fields: title, description, or date')
      }

      if (!editingMoment && (!payload.mediaType || !payload.mediaUrl || !payload.publicId)) {
        throw new Error('Missing required media fields')
      }

      

      if (editingMoment) {
        
        
        toast.success('Historical moment updated successfully!')
      } else {
        
      }

      setShowModal(false)
      setEditingMoment(null)
      setUploadedFiles([])
      reset()
      fetchMoments()
    } catch (error: any) {
      console.error('Error saving moment - Full error object:', error)
      console.error('Error response:', error?.response)
      console.error('Error response data:', error?.response?.data)
      
      // More detailed error messaging
      let errorMessage = 'Failed to save historical moment'
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        // Handle validation errors
        const validationErrors = error.response.data.errors.map((err: any) => err.msg || err.message).join(', ')
        errorMessage = `Validation failed: ${validationErrors}`
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
    }
  }

  const handleEdit = (moment: HistoricalMoment) => {
    setEditingMoment(moment)
    reset({
      title: moment.title,
      description: moment.description,
      date: moment.date.split('T')[0],
      tags: moment.tags.join(', '),
      isHighlighted: moment.isHighlighted
    })
    setUploadedFiles([])
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this historical moment?')) return
    
    try {
      await historicalMomentsApi.delete(id)
      toast.success('Historical moment deleted successfully!')
      fetchMoments()
    } catch (error) {
      toast.error('Failed to delete historical moment')
    }
  }

  const handleToggleHighlight = async (id: string) => {
    try {
      await historicalMomentsApi.toggleHighlight(id)
      toast.success('Highlight status updated!')
      fetchMoments()
    } catch (error) {
      toast.error('Failed to update highlight status')
    }
  }

  const filteredMoments = moments.filter(moment =>
    moment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    moment.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get total media count for a moment
  const getMediaCount = (moment: HistoricalMoment) => {
    return 1 + (moment.mediaFiles ? moment.mediaFiles.length : 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Historical Moments
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage club memories and historical moments
          </p>
        </div>
        <div className="flex space-x-3 w-full sm:w-auto">
          <button 
            onClick={() => {
              setEditingMoment(null)
              setUploadedFiles([])
              reset()
              setShowModal(true)
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>Add Moment</span>
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-4"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search historical moments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
          <select
            value={mediaFilter}
            onChange={(e) => setMediaFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="all">All Media</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
          </select>
        </div>
      </motion.div>

      {/* Moments Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {loading ? (
          <AdminHistoricalMomentsSkeleton />
        ) : filteredMoments.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No historical moments found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMoments.map((moment) => (
              <div key={moment._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="relative">
                  {moment.mediaType === 'image' ? (
                    <img
                      src={moment.mediaUrl}
                      alt={moment.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <video
                      src={moment.mediaUrl}
                      className="w-full h-48 object-cover"
                      controls
                      preload="metadata"
                      muted
                      playsInline
                      poster={moment.thumbnailUrl}
                      onError={(e) => {
                        console.error('Video failed to load:', e)
                       
                      }}
                    />
                  )}
                  
                  <div className="absolute top-2 left-2">
                    {getMediaCount(moment) > 1 && (
                      <div className="bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                        <ImageIcon className="w-3 h-3" />
                        <span>{getMediaCount(moment)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => handleToggleHighlight(moment._id)}
                      className={`p-1 rounded-full ${moment.isHighlighted ? 'bg-yellow-500 text-white' : 'bg-white/80 text-gray-600'}`}
                    >
                      {moment.isHighlighted ? (
                        <Star className="w-4 h-4" />
                      ) : (
                        <StarOff className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {moment.title}
                    </h3>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                      {moment.mediaType}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                    {moment.description}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(moment.date).toLocaleDateString()}
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <div className="flex items-center space-x-1">
                      <span>👁️</span>
                      <span>{moment.views || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>❤️</span>
                      <span>{moment.likes || 0}</span>
                    </div>
                  </div>
                  
                  {moment.tags && moment.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {moment.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {moment.tags.length > 3 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          +{moment.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleEdit(moment)}
                      className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 p-1"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {user?.role === 'admin' && (
                      <button
                        onClick={() => handleDelete(moment._id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 p-0 sm:p-4 sm:flex  sm:justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-4xl sm:rounded-lg shadow-xl overflow-y-auto"
          >
            <div className="p-4 sm:p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {editingMoment ? 'Edit Historical Moment' : 'Add New Historical Moment'}
              </h2>
              
              <form onSubmit={handleSubmit(handleCreateOrUpdate)} className="space-y-6">
                {/* Multiple File Upload */}
                {!editingMoment && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Upload Media Files * (First image will be the main image)
                    </label>
                    
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                      <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <label className="cursor-pointer">
                          <span className="text-purple-600 hover:text-purple-500 text-lg font-medium">Upload files</span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*,video/*"
                            multiple
                            onChange={handleMultipleFileUpload}
                            disabled={uploading}
                            key={uploadedFiles.length} // Reset input when files change
                          />
                        </label>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                          Select multiple images or videos (up to 50MB each)
                        </p>
                        {uploading && (
                          <div className="flex items-center justify-center mt-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                            <span className="ml-2 text-sm text-gray-500">
                              {uploadedFiles.length > 0 ? 
                                `Uploading files... This may take a few minutes for videos.` : 
                                'Uploading...'
                              }
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Preview uploaded files */}
                    {uploadedFiles.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Uploaded Files ({uploadedFiles.length})
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="relative group">
                              {file.mediaType === 'image' ? (
                                <img 
                                  src={file.mediaUrl} 
                                  alt={`Upload ${index + 1}`} 
                                  className="w-full h-24 object-cover rounded-lg" 
                                />
                              ) : (
                                <video 
                                  src={file.mediaUrl} 
                                  className="w-full h-24 object-cover rounded-lg" 
                                  muted 
                                  preload="metadata"
                                  playsInline
                                  poster={file.thumbnailUrl}
                                />
                              )}
                              <button
                                type="button"
                                onClick={() => removeUploadedFile(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              {index === 0 && (
                                <div className="absolute bottom-1 left-1 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                                  Main
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Show existing media for editing */}
                {editingMoment && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Media ({getMediaCount(editingMoment)} files)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      {/* Main media */}
                      <div className="relative">
                        {editingMoment.mediaType === 'image' ? (
                          <img src={editingMoment.mediaUrl} alt={editingMoment.title} className="w-full h-24 object-cover rounded-lg" />
                        ) : (
                          <video 
                            src={editingMoment.mediaUrl} 
                            className="w-full h-24 object-cover rounded-lg" 
                            muted 
                            preload="metadata"
                            playsInline
                            poster={editingMoment.thumbnailUrl}
                          />
                        )}
                        <div className="absolute bottom-1 left-1 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                          Main
                        </div>
                      </div>
                      
                      {/* Additional media files */}
                      {editingMoment.mediaFiles && editingMoment.mediaFiles.map((file, index) => (
                        <div key={index} className="relative">
                          {file.mediaType === 'image' ? (
                            <img src={file.mediaUrl} alt={`Additional ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                          ) : (
                            <video 
                              src={file.mediaUrl} 
                              className="w-full h-24 object-cover rounded-lg" 
                              muted 
                              preload="metadata"
                              playsInline
                              poster={file.thumbnailUrl}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Option to add more files when editing */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Add More Media Files (optional)
                      </label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                        <div className="text-center">
                          <label className="cursor-pointer">
                            <span className="text-purple-600 hover:text-purple-500 font-medium">Add more files</span>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*,video/*"
                              multiple
                              onChange={handleMultipleFileUpload}
                              disabled={uploading}
                            />
                          </label>
                          {uploading && (
                            <div className="flex items-center justify-center mt-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                              <span className="ml-2 text-sm text-gray-500">
                                Uploading additional files... Please wait for video uploads.
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Show newly uploaded files for editing */}
                      {uploadedFiles.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            New Files to Add ({uploadedFiles.length})
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {uploadedFiles.map((file, index) => (
                              <div key={index} className="relative group">
                                {file.mediaType === 'image' ? (
                                  <img 
                                    src={file.mediaUrl} 
                                    alt={`New ${index + 1}`} 
                                    className="w-full h-24 object-cover rounded-lg" 
                                  />
                                ) : (
                                  <video 
                                    src={file.mediaUrl} 
                                    className="w-full h-24 object-cover rounded-lg" 
                                    muted 
                                    preload="metadata"
                                    playsInline
                                    poster={file.thumbnailUrl}
                                  />
                                )}
                                <button
                                  type="button"
                                  onClick={() => removeUploadedFile(index)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title *
                  </label>
                  <input
                    {...register('title', { required: 'Title is required' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter title"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description *
                  </label>
                  <textarea
                    {...register('description', { required: 'Description is required' })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Describe this moment"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      {...register('date', { required: 'Date is required' })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                    {errors.date && (
                      <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
                    )}
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('isHighlighted')}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Highlight this moment
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    {...register('tags')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="e.g., celebration, achievement, milestone"
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingMoment(null)
                      setUploadedFiles([])
                      reset()
                    }}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || uploading}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : editingMoment ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default AdminHistoricalMoments 