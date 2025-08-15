import React from 'react';

const ReportSkeletonLoader = () => {
  return (
    <div className="space-y-6">
      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="bg-white rounded-lg shadow p-6">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mb-2"></div>
            <div className="h-8 bg-gray-300 rounded animate-pulse w-16 mb-1"></div>
            <div className="h-3 bg-gray-100 rounded animate-pulse w-32"></div>
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-6 bg-gray-300 rounded animate-pulse w-48 mb-4"></div>
        <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <div className="h-6 bg-gray-300 rounded animate-pulse w-48"></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {[1, 2, 3, 4, 5].map((col) => (
                  <th key={col} className="px-4 py-3">
                    <div className="h-4 bg-gray-300 rounded animate-pulse w-24"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, row) => (
                <tr key={row} className={row % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {[1, 2, 3, 4, 5].map((col) => (
                    <td key={col} className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportSkeletonLoader;