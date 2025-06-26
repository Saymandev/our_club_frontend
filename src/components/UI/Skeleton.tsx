import { cn } from '@/utils/cn'

interface SkeletonProps {
  className?: string
  children?: React.ReactNode
}

// Base Skeleton component
export const Skeleton = ({ className, children, ...props }: SkeletonProps & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200 dark:bg-gray-700',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Card Skeleton for announcements, events, etc.
export const CardSkeleton = ({ className }: { className?: string }) => {
  return (
    <div className={cn('card p-6 space-y-4', className)}>
      <div className="flex justify-between items-start">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  )
}

// Event Card Skeleton with image
export const EventCardSkeleton = ({ className }: { className?: string }) => {
  return (
    <div className={cn('card overflow-hidden', className)}>
      <Skeleton className="h-48 w-full rounded-t-lg" />
      <div className="p-6 space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-6 w-3/4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
    </div>
  )
}

// List Item Skeleton
export const ListItemSkeleton = ({ className }: { className?: string }) => {
  return (
    <div className={cn('flex items-center space-x-4 p-4', className)}>
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  )
}

// Table Row Skeleton
export const TableRowSkeleton = ({ columns = 4, className }: { columns?: number; className?: string }) => {
  return (
    <tr className={className}>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}

// Full Page Skeleton
export const PageSkeleton = ({ className }: { className?: string }) => {
  return (
    <div className={cn('min-h-screen bg-gray-50 dark:bg-gray-900 py-8', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Skeleton */}
        <div className="text-center mb-12 space-y-4">
          <Skeleton className="h-10 w-64 mx-auto" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>
        
        {/* Content Grid Skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

// Blood Donor List Skeleton
export const BloodDonorSkeleton = ({ className }: { className?: string }) => {
  return (
    <div className={cn('divide-y divide-gray-200 dark:divide-gray-700', className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center space-y-1">
                <Skeleton className="h-6 w-8 mx-auto" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Form Skeleton
export const FormSkeleton = ({ className }: { className?: string }) => {
  return (
    <div className={cn('space-y-6', className)}>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
  )
}

// Dashboard Stats Skeleton
export const DashboardStatsSkeleton = ({ className }: { className?: string }) => {
  return (
    <div className={cn('grid gap-6 md:grid-cols-2 lg:grid-cols-4', className)}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default Skeleton

// Admin page specific skeletons

// Admin Announcements List Skeleton
export const AdminAnnouncementsSkeleton = ({ className }: { className?: string }) => {
  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden', className)}>
      {/* Mobile Card View Skeleton */}
      <div className="block lg:hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
                <div className="flex space-x-2 ml-2">
                  <Skeleton className="w-6 h-6 rounded" />
                  <Skeleton className="w-6 h-6 rounded" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <Skeleton className="h-6 w-12 rounded-full" />
                  <div className="flex items-center space-x-1">
                    <Skeleton className="w-4 h-4 rounded" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Desktop Table View Skeleton */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Skeleton className="h-5 w-16 rounded-full" />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="w-5 h-5 rounded" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end space-x-2">
                    <Skeleton className="w-6 h-6 rounded" />
                    <Skeleton className="w-6 h-6 rounded" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Admin Events List Skeleton
export const AdminEventsSkeleton = ({ className }: { className?: string }) => {
  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden', className)}>
      {/* Mobile Card View Skeleton */}
      <div className="block lg:hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="w-4 h-4 rounded" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
                <div className="flex space-x-2 ml-2">
                  <Skeleton className="w-6 h-6 rounded" />
                  <Skeleton className="w-6 h-6 rounded" />
                  <Skeleton className="w-6 h-6 rounded" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-14 rounded-full" />
                </div>
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Desktop Table View Skeleton */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Published</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="w-4 h-4 rounded" />
                    </div>
                    <Skeleton className="h-3 w-56" />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Skeleton className="h-5 w-20 rounded-full" />
                </td>
                <td className="px-6 py-4">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="px-6 py-4">
                  <Skeleton className="h-5 w-18 rounded-full" />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="w-5 h-5 rounded" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end space-x-2">
                    <Skeleton className="w-6 h-6 rounded" />
                    <Skeleton className="w-6 h-6 rounded" />
                    <Skeleton className="w-6 h-6 rounded" />
                    <Skeleton className="w-6 h-6 rounded" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Admin Historical Moments Grid Skeleton
export const AdminHistoricalMomentsSkeleton = ({ className }: { className?: string }) => {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="relative">
            <Skeleton className="w-full h-48" />
            <div className="absolute top-2 left-2">
              <Skeleton className="h-6 w-8 rounded-full" />
            </div>
            <div className="absolute top-2 right-2">
              <Skeleton className="w-8 h-8 rounded-full" />
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="flex items-center">
              <Skeleton className="w-4 h-4 rounded mr-2" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="h-4 w-6" />
              </div>
              <div className="flex items-center space-x-1">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="h-4 w-6" />
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              <Skeleton className="h-5 w-12 rounded" />
              <Skeleton className="h-5 w-16 rounded" />
              <Skeleton className="h-5 w-10 rounded" />
            </div>
            <div className="flex justify-end space-x-2">
              <Skeleton className="w-6 h-6 rounded" />
              <Skeleton className="w-6 h-6 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 