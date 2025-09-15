import { Award, BookOpen, Clock, FileText, Play, Target, Users } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { examsApi } from '../services/api'

interface Exam {
  _id: string
  title: string
  description: string
  type: 'quiz' | 'document_submission'
  subjectId?: string
  chapterId?: string
  questions: Array<{
    _id: string
    question: string
    type: 'multiple_choice' | 'true_false' | 'text' | 'file_upload'
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
  userAttempts: number
  lastResult?: {
    score: number
    percentage: number
    passed: boolean
    submittedAt: string
  }
}

const ExamsPage: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    type: '',
    search: ''
  })

  const fetchExams = async () => {
    try {
      setLoading(true)
      const response = await examsApi.getAll({ 
        isPublished: 'true',
        ...filters 
      })
      setExams(response.data.data || [])
    } catch (error: any) {
      console.error('Failed to fetch exams:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExams()
  }, [filters])

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'quiz': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
      case 'document_submission': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
      default: return 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-300'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quiz': return <Target className="w-4 h-4" />
      case 'document_submission': return <FileText className="w-4 h-4" />
      default: return <BookOpen className="w-4 h-4" />
    }
  }

  const formatDuration = (minutes: number) => {
    if (minutes === 0) return 'No time limit'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isExamAvailable = (exam: Exam) => {
    const now = new Date()
    const startDate = new Date(exam.startDate)
    const endDate = exam.endDate ? new Date(exam.endDate) : null
    
    return now >= startDate && (!endDate || now <= endDate)
  }

  const canTakeExam = (exam: Exam) => {
    if (!isExamAvailable(exam)) return false
    if (exam.attemptsAllowed === 0) return true // Unlimited attempts
    return exam.userAttempts < exam.attemptsAllowed
  }

  const getExamStatus = (exam: Exam) => {
    if (!isExamAvailable(exam)) {
      const now = new Date()
      const startDate = new Date(exam.startDate)
      if (now < startDate) {
        return { status: 'upcoming', message: `Starts ${formatDate(exam.startDate)}` }
      } else {
        return { status: 'expired', message: 'Exam has ended' }
      }
    }
    
    if (!canTakeExam(exam)) {
      return { status: 'max_attempts', message: 'Max attempts reached' }
    }
    
    if (exam.lastResult?.passed) {
      return { status: 'passed', message: `Passed (${exam.lastResult.percentage}%)` }
    }
    
    if (exam.userAttempts > 0) {
      return { status: 'in_progress', message: `Attempt ${exam.userAttempts + 1} available` }
    }
    
    return { status: 'available', message: 'Ready to take' }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600 dark:text-green-400'
      case 'in_progress': return 'text-blue-600 dark:text-blue-400'
      case 'passed': return 'text-green-600 dark:text-green-400'
      case 'upcoming': return 'text-yellow-600 dark:text-yellow-400'
      case 'expired': return 'text-gray-500 dark:text-gray-400'
      case 'max_attempts': return 'text-red-600 dark:text-red-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Exams & Assessments
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test your knowledge and track your progress
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Exams
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search by title or description..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Types</option>
                <option value="quiz">Quiz</option>
                <option value="document_submission">Document Submission</option>
              </select>
            </div>
          </div>
        </div>

        {/* Exams Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : exams.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No exams found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filters.search || filters.type 
                ? 'Try adjusting your search criteria.' 
                : 'No exams are available at the moment.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => {
              const examStatus = getExamStatus(exam)
              const canTake = canTakeExam(exam)
              
              return (
                <div key={exam._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                          {exam.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                          {exam.description}
                        </p>
                      </div>
                      <div className="ml-3 flex-shrink-0">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(exam.type)}`}>
                          {getTypeIcon(exam.type)}
                          <span className="ml-1">{exam.type === 'quiz' ? 'Quiz' : 'Document'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Exam Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Target className="w-4 h-4 mr-2" />
                        <span>{exam.questions.length} questions • {exam.totalPoints} points</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Award className="w-4 h-4 mr-2" />
                        <span>Passing Score: {exam.passingScore}%</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{formatDuration(exam.timeLimit)}</span>
                      </div>
                      {exam.attemptsAllowed > 0 && (
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Users className="w-4 h-4 mr-2" />
                          <span>Attempts: {exam.userAttempts}/{exam.attemptsAllowed}</span>
                        </div>
                      )}
                    </div>

                    {/* Status */}
                    <div className="mb-4">
                      <div className={`text-sm font-medium ${getStatusColor(examStatus.status)}`}>
                        {examStatus.message}
                      </div>
                      {exam.lastResult && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Last attempt: {formatDate(exam.lastResult.submittedAt)}
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <Link
                      to={canTake ? `/exam/${exam._id}` : '#'}
                      className={`w-full py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 ${
                        canTake
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      }`}
                      onClick={(e) => {
                        if (!canTake) {
                          e.preventDefault()
                        }
                      }}
                    >
                      <Play className="w-4 h-4" />
                      {examStatus.status === 'passed' ? 'Review Results' : 
                       examStatus.status === 'in_progress' ? 'Continue Exam' : 
                       examStatus.status === 'available' ? 'Start Exam' : 
                       'Not Available'}
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Stats */}
        {!loading && exams.length > 0 && (
          <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {exams.length}
                </div>
                <div className="text-gray-600 dark:text-gray-400">Total Exams</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {exams.filter(e => e.type === 'quiz').length}
                </div>
                <div className="text-gray-600 dark:text-gray-400">Quizzes</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {exams.filter(e => e.type === 'document_submission').length}
                </div>
                <div className="text-gray-600 dark:text-gray-400">Document Submissions</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {exams.filter(e => e.lastResult?.passed).length}
                </div>
                <div className="text-gray-600 dark:text-gray-400">Passed</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ExamsPage
