import { historicalMomentsApi, uploadApi } from '@/services/api'
import { motion } from 'framer-motion'
import { Calendar, Camera, Edit, Plus, Search, Star, StarOff, Trash2, Upload } from 'lucide-react'
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
  tags: string[]
  isHighlighted: boolean
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

const AdminHistoricalMoments = () => {
  const [moments, setMoments] = useState<HistoricalMoment[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingMoment, setEditingMoment] = useState<HistoricalMoment | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [mediaFilter, setMediaFilter] = useState('all')
  const [uploading, setUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{
    mediaType: 'image' | 'video'
    mediaUrl: string
    publicId: string
    thumbnailUrl?: string
  } | null>(null)

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')
    
    if (!isImage && !isVideo) {
      toast.error('Please select a valid image or video file')
      return
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB')
      return
    }

    try {
      setUploading(true)
      const response = await uploadApi.single(file, 'historical-moments')
      setUploadedFile({
        mediaType: response.data.data.resourceType,
        mediaUrl: response.data.data.url,
        publicId: response.data.data.publicId,
        thumbnailUrl: response.data.data.thumbnailUrl || response.data.data.url
      })
      toast.success('File uploaded successfully!')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const handleCreateOrUpdate = async (data: HistoricalMomentForm) => {
    const mediaToUse = editingMoment ? {
      mediaType: editingMoment.mediaType,
      mediaUrl: editingMoment.mediaUrl,
      publicId: editingMoment.publicId,
      thumbnailUrl: editingMoment.thumbnailUrl
    } : uploadedFile
    
    if (!mediaToUse) {
      toast.error('Please upload a media file')
      return
    }

    try {
      const payload = {
        ...data,
        tags: data.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        mediaType: mediaToUse.mediaType,
        mediaUrl: mediaToUse.mediaUrl,
        publicId: mediaToUse.publicId,
        thumbnailUrl: mediaToUse.thumbnailUrl
      }

      if (editingMoment) {
        await historicalMomentsApi.update(editingMoment._id, payload)
        toast.success('Historical moment updated successfully!')
      } else {
        await historicalMomentsApi.create(payload)
        toast.success('Historical moment created successfully!')
      }

      setShowModal(false)
      setEditingMoment(null)
      setUploadedFile(null)
      reset()
      fetchMoments()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save historical moment')
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
    setUploadedFile(null)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Historical Moments
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage club memories and historical moments
          </p>
        </div>
        <button 
          onClick={() => {
            setEditingMoment(null)
            setUploadedFile(null)
            reset()
            setShowModal(true)
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Moment</span>
        </button>
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Loading moments...</p>
          </div>
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
                    />
                  )}
                  
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
                    <button
                      onClick={() => handleDelete(moment._id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {editingMoment ? 'Edit Historical Moment' : 'Add New Historical Moment'}
              </h2>
              
              <form onSubmit={handleSubmit(handleCreateOrUpdate)} className="space-y-6">
                {/* Single File Upload */}
                {!editingMoment && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Upload Media File *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                      {!uploadedFile ? (
                        <div className="text-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <label className="cursor-pointer">
                            <span className="text-purple-600 hover:text-purple-500 text-lg font-medium">Upload file</span>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*,video/*"
                              onChange={handleFileUpload}
                              disabled={uploading}
                            />
                          </label>
                          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                            Select an image or video (up to 50MB)
                          </p>
                          {uploading && (
                            <div className="flex items-center justify-center mt-4">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                              <span className="ml-2 text-sm text-gray-500">Uploading...</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center">
                          {uploadedFile.mediaType === 'image' ? (
                            <img src={uploadedFile.mediaUrl} alt="Upload preview" className="w-48 h-32 object-cover rounded-lg mx-auto mb-4" />
                          ) : (
                            <video src={uploadedFile.mediaUrl} className="w-48 h-32 object-cover rounded-lg mx-auto mb-4" muted />
                          )}
                          <p className="text-green-600 dark:text-green-400 text-sm mb-2">
                            ✓ File uploaded successfully
                          </p>
                          <button
                            type="button"
                            onClick={() => setUploadedFile(null)}
                            className="text-red-600 hover:text-red-500 text-sm"
                          >
                            Remove file
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Show existing media for editing */}
                {editingMoment && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Media
                    </label>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      {editingMoment.mediaType === 'image' ? (
                        <img src={editingMoment.mediaUrl} alt={editingMoment.title} className="w-48 h-32 object-cover rounded-lg mx-auto" />
                      ) : (
                        <video src={editingMoment.mediaUrl} className="w-48 h-32 object-cover rounded-lg mx-auto" muted />
                      )}
                      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                        {editingMoment.mediaType} file
                      </p>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingMoment(null)
                      setUploadedFile(null)
                      reset()
                    }}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
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