import { motion } from 'framer-motion';
import {
    Edit2,
    ExternalLink,
    Eye,
    EyeOff,
    Image as ImageIcon,
    Plus,
    Trash2
} from 'lucide-react';
import { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { sliderApi, uploadApi } from '../../services/api';

interface SliderImage {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  order: number;
  linkUrl?: string;
  linkText?: string;
  createdAt: string;
  updatedAt: string;
}

const AdminSlider = () => {
  const [sliderImages, setSliderImages] = useState<SliderImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSlide, setEditingSlide] = useState<SliderImage | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    isActive: true,
    order: 0,
    linkUrl: '',
    linkText: ''
  });

  useEffect(() => {
    fetchSliderImages();
  }, []);

  const fetchSliderImages = async () => {
    try {
      setLoading(true);
      const response = await sliderApi.getAll();
      if (response.data.success) {
        setSliderImages(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching slider images:', error);
      setError('Failed to fetch slider images');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const uploadData = new FormData();
      uploadData.append('file', file);

      const response = await uploadApi.uploadSingle(uploadData);
      if (response.data.success) {
        setFormData(prev => ({
          ...prev,
          imageUrl: response.data.data.url
        }));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSlide) {
        await sliderApi.update(editingSlide._id, formData);
      } else {
        await sliderApi.create(formData);
      }
      
      setShowForm(false);
      setEditingSlide(null);
      setFormData({
        title: '',
        description: '',
        imageUrl: '',
        isActive: true,
        order: 0,
        linkUrl: '',
        linkText: ''
      });
      fetchSliderImages();
    } catch (error) {
      console.error('Error saving slider image:', error);
      setError('Failed to save slider image');
    }
  };

  const handleEdit = (slide: SliderImage) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title,
      description: slide.description,
      imageUrl: slide.imageUrl,
      isActive: slide.isActive,
      order: slide.order,
      linkUrl: slide.linkUrl || '',
      linkText: slide.linkText || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this slider image?')) return;
    
    try {
      await sliderApi.delete(id);
      fetchSliderImages();
    } catch (error) {
      console.error('Error deleting slider image:', error);
      setError('Failed to delete slider image');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await sliderApi.toggle(id);
      fetchSliderImages();
    } catch (error) {
      console.error('Error toggling slider status:', error);
      setError('Failed to update slider status');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingSlide(null);
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      isActive: true,
      order: 0,
      linkUrl: '',
      linkText: ''
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Slider Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage homepage banner slider images
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
        >
          <Plus size={24} />
          Add Slider Image
        </motion.button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Slider Images Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sliderImages.map((slide) => (
          <motion.div
            key={slide._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
          >
            <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
              {slide.imageUrl ? (
                <img
                  src={slide.imageUrl}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <ImageIcon size={48} className="text-gray-400" />
                </div>
              )}
              
              {/* Status Badge */}
              <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium ${
                slide.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {slide.isActive ? 'Active' : 'Inactive'}
              </div>

              {/* Order Badge */}
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                Order: {slide.order}
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 dark:text-white">
                {slide.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                {slide.description}
              </p>

              {slide.linkUrl && (
                <div className="flex items-center gap-1 text-blue-600 text-sm mb-4">
                  <ExternalLink size={14} />
                  <span>{slide.linkText || 'Link'}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(slide)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(slide._id)}
                    className={`p-2 rounded-lg transition-colors ${
                      slide.isActive
                        ? 'text-orange-600 hover:bg-orange-100'
                        : 'text-green-600 hover:bg-green-100'
                    }`}
                  >
                    {slide.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    onClick={() => handleDelete(slide._id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(slide.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {sliderImages.length === 0 && !loading && (
        <div className="text-center py-12">
          <ImageIcon size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            No slider images yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Get started by adding your first slider image
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Add Slider Image
          </button>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 dark:text-white">
                {editingSlide ? 'Edit Slider Image' : 'Add Slider Image'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter slide title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description * (max 500 characters)
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    maxLength={500}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter slide description"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">
                      Supports multiple languages including Bengali, English, etc.
                    </span>
                    <span className={`text-xs ${
                      formData.description.length > 450 
                        ? 'text-red-500' 
                        : formData.description.length > 400 
                        ? 'text-yellow-500' 
                        : 'text-gray-500'
                    }`}>
                      {formData.description.length}/500
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Image *
                  </label>
                  <div className="space-y-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {uploading && <p className="text-sm text-blue-600">Uploading...</p>}
                    {formData.imageUrl && (
                      <div className="relative">
                        <img
                          src={formData.imageUrl}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Order
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.order}
                      onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="flex items-center space-x-2 mt-8">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Active
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Link URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Link Text (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.linkText}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkText: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Learn More"
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!formData.title || !formData.description || !formData.imageUrl}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {editingSlide ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminSlider; 