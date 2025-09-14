import { Edit, Eye, EyeOff, FileText, Plus, Trash2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { examsApi } from '../../services/api'

interface Exam {
  _id: string
  title: string
  description: string
  type: 'quiz' | 'document_submission'
  subjectId?: string
  chapterId?: string
  questions: Array<{
    _id?: string
    question: string
    type: 'multiple_choice' | 'true_false' | 'text' | 'file_upload'
    options?: string[]
    correctAnswer?: string | string[]
    points: number
    required: boolean
  }>
  totalPoints: number
  passingScore: number
  timeLimit: number
  attemptsAllowed: number
  startDate: string
  endDate?: string
  isPublished: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface ExamFormData {
  title: string
  description: string
  type: 'quiz' | 'document_submission'
  subjectId: string
  chapterId: string
  questions: Array<{
    question: string
    type: 'multiple_choice' | 'true_false' | 'text' | 'file_upload'
    options: string
    correctAnswer: string
    points: number
    required: boolean
  }>
  passingScore: number
  timeLimit: number
  attemptsAllowed: number
  startDate: string
  endDate: string
  isPublished: boolean
}

const AdminExams: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingExam, setEditingExam] = useState<Exam | null>(null)
  const [filters, setFilters] = useState({
    type: '',
    isPublished: ''
  })

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ExamFormData>()

  const questions = watch('questions') || []

  const fetchExams = async () => {
    try {
      setLoading(true)
      const response = await examsApi.getAll(filters)
      setExams(response.data.data)
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to fetch exams')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExams()
  }, [filters])

  const onSubmit = async (data: ExamFormData) => {
    try {
      // Process questions data
      const processedQuestions = data.questions.map(question => ({
        question: question.question,
        type: question.type,
        options: question.type === 'multiple_choice' ? question.options.split(',').map(opt => opt.trim()) : undefined,
        correctAnswer: question.type === 'multiple_choice' 
          ? question.correctAnswer.split(',').map(ans => ans.trim())
          : question.correctAnswer,
        points: Number(question.points),
        required: question.required
      }))

      const examData = {
        ...data,
        questions: processedQuestions,
        passingScore: Number(data.passingScore),
        timeLimit: Number(data.timeLimit),
        attemptsAllowed: Number(data.attemptsAllowed),
        subjectId: data.subjectId || undefined,
        chapterId: data.chapterId || undefined,
        endDate: data.endDate || undefined
      }

      if (editingExam) {
        await examsApi.update(editingExam._id, examData)
        toast.success('Exam updated successfully!')
      } else {
        await examsApi.create(examData)
        toast.success('Exam created successfully!')
      }

      setShowModal(false)
      setEditingExam(null)
      reset()
      fetchExams()
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to save exam')
    }
  }

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam)
    setValue('title', exam.title)
    setValue('description', exam.description)
    setValue('type', exam.type)
    setValue('subjectId', exam.subjectId || '')
    setValue('chapterId', exam.chapterId || '')
    setValue('passingScore', exam.passingScore)
    setValue('timeLimit', exam.timeLimit)
    setValue('attemptsAllowed', exam.attemptsAllowed)
    setValue('startDate', exam.startDate.split('T')[0])
    setValue('endDate', exam.endDate ? exam.endDate.split('T')[0] : '')
    setValue('isPublished', exam.isPublished)
    
    // Process questions for form
    const processedQuestions = exam.questions.map(q => ({
      question: q.question,
      type: q.type,
      options: q.options ? q.options.join(', ') : '',
      correctAnswer: Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer || '',
      points: q.points,
      required: q.required
    }))
    setValue('questions', processedQuestions)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exam?')) return

    try {
      await examsApi.delete(id)
      toast.success('Exam deleted successfully!')
      fetchExams()
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to delete exam')
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingExam(null)
    reset()
  }

  const addQuestion = () => {
    const currentQuestions = questions || []
    setValue('questions', [
      ...currentQuestions,
      {
        question: '',
        type: 'multiple_choice',
        options: '',
        correctAnswer: '',
        points: 1,
        required: true
      }
    ])
  }

  const removeQuestion = (index: number) => {
    const currentQuestions = questions || []
    setValue('questions', currentQuestions.filter((_, i) => i !== index))
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'quiz': return 'bg-blue-100 text-blue-800'
      case 'document_submission': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exam Management</h1>
          <p className="text-gray-600">Create and manage quizzes and document submission exams</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Exam
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="quiz">Quiz</option>
              <option value="document_submission">Document Submission</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.isPublished}
              onChange={(e) => setFilters({ ...filters, isPublished: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="true">Published</option>
              <option value="false">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Exams List */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading exams...</p>
          </div>
        ) : exams.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No exams found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {exams.map((exam) => (
                  <tr key={exam._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{exam.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{exam.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(exam.type)}`}>
                        {exam.type === 'quiz' ? 'Quiz' : 'Document Submission'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {exam.questions.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {exam.totalPoints}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(exam.startDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {exam.isPublished ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            <Eye className="w-3 h-3 mr-1" />
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            <EyeOff className="w-3 h-3 mr-1" />
                            Draft
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(exam)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(exam._id)}
                          className="text-red-600 hover:text-red-900"
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

      {/* Exam Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingExam ? 'Edit Exam' : 'Add New Exam'}
            </h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    {...register('title', { required: 'Title is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Exam title"
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    {...register('type', { required: 'Type is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="quiz">Quiz</option>
                    <option value="document_submission">Document Submission</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  {...register('description', { required: 'Description is required' })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Exam description"
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Passing Score (%) *</label>
                  <input
                    {...register('passingScore', { required: 'Passing score is required', min: 0, max: 100 })}
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="70"
                  />
                  {errors.passingScore && <p className="text-red-500 text-xs mt-1">{errors.passingScore.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit (minutes)</label>
                  <input
                    {...register('timeLimit')}
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Attempts Allowed</label>
                  <input
                    {...register('attemptsAllowed')}
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0 (unlimited)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input
                    {...register('startDate', { required: 'Start date is required' })}
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    {...register('endDate')}
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Questions Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">Questions</label>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    Add Question
                  </button>
                </div>

                {questions.map((question, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Question {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Question Text *</label>
                        <textarea
                          {...register(`questions.${index}.question`, { required: 'Question text is required' })}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter question text"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                          <select
                            {...register(`questions.${index}.type`, { required: 'Question type is required' })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="multiple_choice">Multiple Choice</option>
                            <option value="true_false">True/False</option>
                            <option value="text">Text Answer</option>
                            <option value="file_upload">File Upload</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Points *</label>
                          <input
                            {...register(`questions.${index}.points`, { required: 'Points are required', min: 1 })}
                            type="number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="1"
                          />
                        </div>
                      </div>

                      {question.type === 'multiple_choice' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Options (comma-separated)</label>
                          <input
                            {...register(`questions.${index}.options`)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Option 1, Option 2, Option 3"
                          />
                        </div>
                      )}

                      {(question.type === 'multiple_choice' || question.type === 'true_false') && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                          <input
                            {...register(`questions.${index}.correctAnswer`)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Correct answer"
                          />
                        </div>
                      )}

                      <div className="flex items-center">
                        <input
                          {...register(`questions.${index}.required`)}
                          type="checkbox"
                          id={`required-${index}`}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`required-${index}`} className="ml-2 block text-sm text-gray-900">
                          Required question
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center">
                <input
                  {...register('isPublished')}
                  type="checkbox"
                  id="isPublished"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900">
                  Publish this exam
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingExam ? 'Update Exam' : 'Create Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminExams
