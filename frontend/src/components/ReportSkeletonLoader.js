import React from 'react';

const ReportSkeletonLoader = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="h-9 bg-gray-300 rounded animate-pulse w-96 mb-6"></div>
        
        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-blue-600 rounded-lg p-6">
              <div className="h-8 bg-white bg-opacity-20 rounded animate-pulse w-16 mb-2"></div>
              <div className="h-4 bg-white bg-opacity-30 rounded animate-pulse w-24"></div>
            </div>
          ))}
        </div>

        {/* Controls skeleton */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="h-10 bg-gray-300 rounded animate-pulse w-32"></div>
          <div className="h-10 bg-gray-300 rounded animate-pulse w-32"></div>
        </div>

        {/* Charts section skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pie Chart skeleton */}
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="h-6 bg-gray-300 rounded animate-pulse w-80 mb-4"></div>
            <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
          </div>

          {/* Bar Chart skeleton */}
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="h-6 bg-gray-300 rounded animate-pulse w-72 mb-4"></div>
            <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Line Chart and Table section skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Line Chart skeleton */}
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="h-6 bg-gray-300 rounded animate-pulse w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-40 mb-4"></div>
            <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
          </div>

          {/* Department Table skeleton */}
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="h-6 bg-gray-300 rounded animate-pulse w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-40"></div>
              </div>
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-blue-600">
                    {[1, 2, 3, 4].map((col) => (
                      <th key={col} className="px-4 py-3">
                        <div className="h-4 bg-white bg-opacity-20 rounded animate-pulse w-20"></div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, row) => (
                    <tr key={row} className={row % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      {[1, 2, 3, 4].map((col) => (
                        <td key={col} className="px-4 py-3">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Project Tables section skeleton */}
        <div className="mt-8 space-y-6">
          {/* Project header skeleton */}
          <div className="flex justify-between items-center">
            <div className="h-7 bg-gray-300 rounded animate-pulse w-64"></div>
            <div className="h-10 bg-gray-300 rounded animate-pulse w-32"></div>
          </div>
          
          {/* Project tables skeleton */}
          {[1, 2, 3].map((table) => (
            <div key={table} className="bg-white rounded-lg p-6 shadow">
              <div className="h-6 bg-gray-300 rounded animate-pulse w-80 mb-4"></div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-sm">
                  <thead className="bg-blue-600">
                    <tr>
                      {Array.from({ length: 11 }).map((_, col) => (
                        <th key={col} className="px-4 py-3">
                          <div className="h-4 bg-white bg-opacity-20 rounded animate-pulse w-16"></div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 10 }).map((_, row) => (
                      <tr key={row} className={row % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        {Array.from({ length: 11 }).map((_, col) => (
                          <td key={col} className="px-4 py-3">
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination skeleton */}
              <div className="flex flex-col sm:flex-row justify-between items-center mt-4 px-4 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-2 sm:mb-0">
                  <div className="h-4 bg-gray-300 rounded animate-pulse w-8"></div>
                  <div className="h-8 bg-gray-300 rounded animate-pulse w-16"></div>
                  <div className="h-4 bg-gray-300 rounded animate-pulse w-20"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 bg-gray-300 rounded animate-pulse w-32"></div>
                  {Array.from({ length: 8 }).map((_, btn) => (
                    <div key={btn} className="w-8 h-8 bg-gray-300 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportSkeletonLoader;