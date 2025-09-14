import { ArrowLeft, CheckCircle, Clock, FileText, XCircle } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { examsApi } from '../services/api'

interface ExamResult {
  _id: string
  examId: {
    _id: string
    title: string
    type: 'quiz' | 'document_submission'
    totalPoints: number
    passingScore: number
  }
  totalScore: number
  percentage: number
  passed: boolean
  timeSpent: number
  submittedAt: string
  attemptNumber: number
}

const ExamResultsPage: React.FC = () => {
  const [results, setResults] = useState<ExamResult[]>([])
  const [loading, setLoading] = useState(true)

  const fetchResults = async () => {
    try {
      setLoading(true)
      const response = await examsApi.getMyResults()
      setResults(response.data.data)
    } catch (error: any) {
      console.error('Failed to fetch exam results:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResults()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/courses" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">My Exam Results</h1>
          <p className="text-gray-600 mt-2">View your exam performance and scores</p>
        </div>

        {/* Results */}
        {results.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No exam results found</h3>
            <p className="text-gray-600 mb-4">
              You haven't taken any exams yet. Start learning and take your first exam!
            </p>
            <Link
              to="/courses"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {results.map((result) => (
              <div key={result._id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {result.examId.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        <span>
                          {result.examId.type === 'quiz' ? 'Quiz' : 'Document Submission'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Attempt #{result.attemptNumber}</span>
                      </div>
                      <span>{formatDate(result.submittedAt)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      result.passed ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {result.percentage}%
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      {result.passed ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-green-600">Passed</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span className="text-red-600">Failed</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Score</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {result.totalScore} / {result.examId.totalPoints}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Time Spent</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {formatTime(result.timeSpent)}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Passing Score</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {result.examId.passingScore}%
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Your Score</span>
                    <span>{result.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        result.passed ? 'bg-green-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${Math.min(result.percentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span className="text-gray-600">{result.examId.passingScore}% (Pass)</span>
                    <span>100%</span>
                  </div>
                </div>

                {result.examId.type === 'document_submission' && !result.passed && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <FileText className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-yellow-800">
                          Document Submission
                        </div>
                        <div className="text-sm text-yellow-700 mt-1">
                          Your document has been submitted and is awaiting manual review.
                          Results will be updated once grading is complete.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {results.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {results.length}
                </div>
                <div className="text-sm text-gray-600">Total Exams</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {results.filter(r => r.passed).length}
                </div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600 mb-1">
                  {Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)}%
                </div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {Math.round(results.reduce((sum, r) => sum + r.timeSpent, 0) / results.length)}m
                </div>
                <div className="text-sm text-gray-600">Avg Time</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ExamResultsPage
