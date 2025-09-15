import { ArrowLeft, Clock, FileText, Send } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { examsApi } from '../services/api'

interface Exam {
  _id: string
  title: string
  description: string
  type: 'quiz' | 'document_submission'
  questions: Array<{
    _id: string
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
  userAttempts: number
  lastResult?: any
}

interface ExamAnswer {
  questionId: string
  answer: string | string[] | File
}

const ExamPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [exam, setExam] = useState<Exam | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [answers, setAnswers] = useState<ExamAnswer[]>([])
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [timeSpent, setTimeSpent] = useState(0)

  const fetchExam = async () => {
    try {
      setLoading(true)
      const response = await examsApi.getById(id!)
      const { exam: examData, userAttempts, lastResult } = response.data.data
      
      // Combine exam data with user-specific data
      const examWithUserData = {
        ...examData,
        userAttempts,
        lastResult
      }
      setExam(examWithUserData)
      
      // Initialize answers array
      const initialAnswers = examData.questions.map((q: any) => ({
        questionId: q._id,
        answer: q.type === 'multiple_choice' ? [] : ''
      }))
      setAnswers(initialAnswers)

      // Set up timer if exam has time limit
      if (examData.timeLimit > 0) {
        setTimeRemaining(examData.timeLimit * 60) // Convert minutes to seconds
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load exam')
      navigate('/courses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchExam()
    }
  }, [id])

  // Timer effect
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitExam()
            return 0
          }
          return prev - 1
        })
        setTimeSpent(prev => prev + 1)
      }, 1000)

      return () => clearInterval(timer)
    } else if (exam?.timeLimit && exam.timeLimit > 0) {
      const timer = setInterval(() => {
        setTimeSpent(prev => prev + 1)
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [timeRemaining, exam])

  const updateAnswer = (questionId: string, answer: string | string[] | File) => {
    setAnswers(prev => prev.map(a => 
      a.questionId === questionId ? { ...a, answer } : a
    ))
  }

  const handleSubmitExam = async () => {
    if (!exam) return

    try {
      setSubmitting(true)
      
      // Validate required questions
      const requiredQuestions = exam.questions?.filter(q => q.required) || []
      const missingAnswers = requiredQuestions.filter(q => {
        const answer = answers.find(a => a.questionId === q._id)
        return !answer || !answer.answer || 
          (Array.isArray(answer.answer) && answer.answer.length === 0) ||
          (typeof answer.answer === 'string' && answer.answer.trim() === '')
      })

      if (missingAnswers.length > 0) {
        toast.error(`Please answer all required questions (${missingAnswers.length} remaining)`)
        return
      }

      const submitData = {
        answers: answers.filter(a => a.answer !== '' && 
          (!Array.isArray(a.answer) || a.answer.length > 0)),
        timeSpent: Math.floor(timeSpent / 60) // Convert seconds to minutes
      }

      await examsApi.submit(exam._id, submitData)
      toast.success('Exam submitted successfully!')
      navigate('/exam-results')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit exam')
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
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

  if (!exam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Exam not found</h2>
          <p className="text-gray-600">The exam you're looking for doesn't exist.</p>
          <Link to="/courses" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
            ← Back to Courses
          </Link>
        </div>
      </div>
    )
  }

  // Check if exam has ended
  if (exam.endDate && new Date(exam.endDate) < new Date()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Exam has ended</h2>
          <p className="text-gray-600">This exam is no longer available.</p>
          <Link to="/courses" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
            ← Back to Courses
          </Link>
        </div>
      </div>
    )
  }

  // Check if exam hasn't started
  if (new Date(exam.startDate) > new Date()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Exam not available yet</h2>
          <p className="text-gray-600">
            This exam will be available on {new Date(exam.startDate).toLocaleDateString()}
          </p>
          <Link to="/courses" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
            ← Back to Courses
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
            <div className="flex items-start gap-3 sm:gap-4">
              <Link to="/courses" className="text-gray-600 hover:text-gray-900 flex-shrink-0 mt-1">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">{exam.title}</h1>
                <p className="text-sm sm:text-base text-gray-600 break-words">{exam.description}</p>
              </div>
            </div>
            <div className="flex flex-col sm:text-right gap-2">
              {exam.timeLimit > 0 && (
                <div className={`text-lg sm:text-xl font-semibold ${
                  timeRemaining < 300 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {formatTime(timeRemaining)}
                </div>
              )}
              <div className="text-sm text-gray-500">
                {exam.questions?.length || 0} questions • {exam.totalPoints} points
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>{exam.type === 'quiz' ? 'Quiz' : 'Document Submission'}</span>
            </div>
            <div>Passing Score: {exam.passingScore}%</div>
            {exam.attemptsAllowed > 0 && (
              <div>Attempts: {exam.userAttempts}/{exam.attemptsAllowed}</div>
            )}
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4 sm:space-y-6">
          {exam.questions?.map((question, index) => (
            <div key={question._id} className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm sm:text-base">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                      {question.question}
                    </h3>
                    <div className="flex items-center gap-2">
                      {question.required && (
                        <span className="text-red-500 text-sm">*</span>
                      )}
                      <span className="text-sm text-gray-500 whitespace-nowrap">
                        ({question.points} points)
                      </span>
                    </div>
                  </div>

                  {/* Multiple Choice */}
                  {question.type === 'multiple_choice' && (
                    <div className="space-y-2">
                      {question.options?.map((option, optionIndex) => (
                        <label key={optionIndex} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="radio"
                            name={`question-${question._id}`}
                            value={option}
                            onChange={(e) => updateAnswer(question._id, e.target.value)}
                            className="text-blue-600 focus:ring-blue-500 mt-1 flex-shrink-0"
                          />
                          <span className="text-gray-900 break-words">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* True/False */}
                  {question.type === 'true_false' && (
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name={`question-${question._id}`}
                          value="true"
                          onChange={(e) => updateAnswer(question._id, e.target.value)}
                          className="text-blue-600 focus:ring-blue-500 flex-shrink-0"
                        />
                        <span className="text-gray-900">True</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name={`question-${question._id}`}
                          value="false"
                          onChange={(e) => updateAnswer(question._id, e.target.value)}
                          className="text-blue-600 focus:ring-blue-500 flex-shrink-0"
                        />
                        <span className="text-gray-900">False</span>
                      </label>
                    </div>
                  )}

                  {/* Text Answer */}
                  {question.type === 'text' && (
                    <textarea
                      onChange={(e) => updateAnswer(question._id, e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                      rows={4}
                      placeholder="Enter your answer here..."
                    />
                  )}

                  {/* File Upload */}
                  {question.type === 'file_upload' && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center">
                      <input
                        type="file"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            updateAnswer(question._id, e.target.files[0])
                          }
                        }}
                        className="hidden"
                        id={`file-${question._id}`}
                      />
                      <label
                        htmlFor={`file-${question._id}`}
                        className="cursor-pointer"
                      >
                        <div className="text-gray-600">
                          <FileText className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2" />
                          <p className="text-sm sm:text-base">Click to upload a file</p>
                          <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            PDF, DOC, DOCX, or image files
                          </p>
                        </div>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="mt-6 sm:mt-8 flex justify-end">
          <button
            onClick={handleSubmitExam}
            disabled={submitting}
            className="bg-blue-600 text-white px-6 sm:px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Submitting...' : 'Submit Exam'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExamPage
