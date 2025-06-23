import LoadingSpinner from '@/components/UI/LoadingSpinner'
import { eventsApi } from '@/services/api'
import { motion } from 'framer-motion'
import {
    AlertCircle,
    CheckCircle,
    CreditCard,
    Eye,
    FileImage,
    Search,
    X,
    XCircle
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

interface PendingPayment {
  _id: string
  participantName: string
  participantPhone: string
  participantEmail?: string
  registrationDate: string
  paymentStatus: string
  paymentInfo: {
    transactionId: string
    paymentMethod: string
    receiptImage?: {
      url: string
      filename: string
    }
    verificationStatus: string
  }
  event: {
    _id: string
    title: string
    fee: number
    eventDate: string
  }
}

interface VerificationForm {
  status: 'verified' | 'rejected'
  note: string
}

const AdminPaymentVerification = () => {
  const [payments, setPayments] = useState<PendingPayment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, _setCurrentPage] = useState(1)
  const [_totalPages, _setTotalPages] = useState(1)
  const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<VerificationForm>()

  useEffect(() => {
    fetchPendingPayments()
  }, [currentPage])

  const fetchPendingPayments = async () => {
    setIsLoading(true)
    try {
      const response = await eventsApi.getPendingPayments({
        page: currentPage,
        limit: 20
      })
      
      if (response.data.success) {
        setPayments(response.data.data)
        _setTotalPages(response.data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Error fetching pending payments:', error)
      toast.error('Failed to fetch pending payments')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyPayment = async (data: VerificationForm) => {
    if (!selectedPayment) return
    
    setIsVerifying(true)
    try {
      await eventsApi.verifyPayment(selectedPayment._id, {
        status: data.status,
        note: data.note
      })
      
      toast.success(`Payment ${data.status} successfully`)
      setShowVerificationModal(false)
      setSelectedPayment(null)
      reset()
      await fetchPendingPayments()
    } catch (error: any) {
      console.error('Error verifying payment:', error)
      toast.error(error.response?.data?.message || 'Failed to verify payment')
    } finally {
      setIsVerifying(false)
    }
  }

  const openVerificationModal = (payment: PendingPayment) => {
    setSelectedPayment(payment)
    setShowVerificationModal(true)
    reset({ status: 'verified', note: '' })
  }

  const getPaymentMethodLabel = (method: string) => {
    const labels: { [key: string]: string } = {
      bkash: 'bKash',
      nagad: 'Nagad',
      rocket: 'Rocket',
      upay: 'Upay',
      bank_transfer: 'Bank Transfer',
      cash: 'Cash',
      other: 'Other'
    }
    return labels[method] || method
  }

  const filteredPayments = payments.filter(payment =>
    payment.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.paymentInfo.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Payment Verification
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Review and verify pending payment submissions
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg px-4 py-2">
            <div className="flex items-center text-white">
              <CreditCard className="w-5 h-5 mr-2" />
              <div className="text-right">
                <div className="text-sm opacity-90">Pending Payments</div>
                <div className="text-xl font-bold">{payments.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6"
      >
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, event, or transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </motion.div>

      {/* Payments List */}
      {isLoading ? (
        <div className="text-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredPayments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No pending payments found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? 'Try adjusting your search criteria' : 'All payments have been processed'}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredPayments.map((payment, index) => (
            <motion.div
              key={payment._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Event & Participant Info */}
                <div className="lg:col-span-2">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">
                        {payment.event.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(payment.event.eventDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ৳{payment.event.fee}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Participant:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {payment.participantName}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Phone:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {payment.participantPhone}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="lg:border-l lg:border-gray-200 lg:dark:border-gray-700 lg:pl-6">
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">Payment Method:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {getPaymentMethodLabel(payment.paymentInfo.paymentMethod)}
                      </p>
                    </div>
                    
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">Transaction ID:</span>
                      <p className="font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">
                        {payment.paymentInfo.transactionId}
                      </p>
                    </div>
                    
                    {payment.paymentInfo.receiptImage && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">Receipt:</span>
                        <div className="mt-1">
                          <a
                            href={payment.paymentInfo.receiptImage.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                          >
                            <FileImage className="w-4 h-4 mr-1" />
                            View Receipt
                          </a>
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => openVerificationModal(payment)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Review Payment
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Verification Modal */}
      {showVerificationModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Verify Payment
                </h2>
                <button
                  onClick={() => {
                    setShowVerificationModal(false)
                    setSelectedPayment(null)
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Payment Details */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                  Payment Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Event:</span>
                    <p className="font-medium">{selectedPayment.event.title}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                    <p className="font-medium">৳{selectedPayment.event.fee}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Participant:</span>
                    <p className="font-medium">{selectedPayment.participantName}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Phone:</span>
                    <p className="font-medium">{selectedPayment.participantPhone}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Payment Method:</span>
                    <p className="font-medium">
                      {getPaymentMethodLabel(selectedPayment.paymentInfo.paymentMethod)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Transaction ID:</span>
                    <p className="font-mono font-medium">
                      {selectedPayment.paymentInfo.transactionId}
                    </p>
                  </div>
                </div>
                
                {selectedPayment.paymentInfo.receiptImage && (
                  <div className="mt-4">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">Receipt Image:</span>
                    <div className="mt-2">
                      <img
                        src={selectedPayment.paymentInfo.receiptImage.url}
                        alt="Payment Receipt"
                        className="max-w-full h-auto max-h-64 rounded-lg border border-gray-200 dark:border-gray-600"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Verification Form */}
              <form onSubmit={handleSubmit(handleVerifyPayment)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Verification Decision *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                      <input
                        type="radio"
                        {...register('status', { required: 'Please select a verification status' })}
                        value="verified"
                        className="mr-3 text-green-600 focus:ring-green-500"
                      />
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-green-700 dark:text-green-400 font-medium">
                        Verify Payment
                      </span>
                    </label>
                    
                    <label className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                      <input
                        type="radio"
                        {...register('status', { required: 'Please select a verification status' })}
                        value="rejected"
                        className="mr-3 text-red-600 focus:ring-red-500"
                      />
                      <XCircle className="w-5 h-5 text-red-600 mr-2" />
                      <span className="text-red-700 dark:text-red-400 font-medium">
                        Reject Payment
                      </span>
                    </label>
                  </div>
                  {errors.status && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.status.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Verification Note (Optional)
                  </label>
                  <textarea
                    {...register('note')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add any notes about this verification..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
                  >
                    {isVerifying ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span className="ml-2">Processing...</span>
                      </>
                    ) : (
                      'Submit Verification'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowVerificationModal(false)
                      setSelectedPayment(null)
                    }}
                    className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
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

export default AdminPaymentVerification 