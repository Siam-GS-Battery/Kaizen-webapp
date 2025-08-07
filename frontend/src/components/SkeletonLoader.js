import React from 'react';

const SkeletonLoader = ({ rows = 5 }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left">
                <div className="w-4 h-4 bg-blue-500 rounded animate-pulse"></div>
              </th>
              <th className="px-4 py-3 text-left">
                <div className="h-4 bg-blue-500 rounded animate-pulse w-24"></div>
              </th>
              <th className="px-4 py-3 text-left">
                <div className="h-4 bg-blue-500 rounded animate-pulse w-32"></div>
              </th>
              <th className="px-4 py-3 text-left">
                <div className="h-4 bg-blue-500 rounded animate-pulse w-16"></div>
              </th>
              <th className="px-4 py-3 text-left">
                <div className="h-4 bg-blue-500 rounded animate-pulse w-20"></div>
              </th>
              <th className="px-4 py-3 text-left">
                <div className="h-4 bg-blue-500 rounded animate-pulse w-16"></div>
              </th>
              <th className="px-4 py-3 text-left">
                <div className="h-4 bg-blue-500 rounded animate-pulse w-20"></div>
              </th>
              <th className="px-4 py-3 text-left">
                <div className="h-4 bg-blue-500 rounded animate-pulse w-16"></div>
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="px-4 py-3">
                  <div className="w-4 h-4 bg-gray-300 rounded animate-pulse"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 bg-gray-300 rounded animate-pulse w-32"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 bg-gray-300 rounded animate-pulse w-24"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 bg-gray-300 rounded animate-pulse w-20"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 bg-gray-300 rounded animate-pulse w-28"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-6 bg-gray-300 rounded-full animate-pulse w-24"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 bg-gray-300 rounded animate-pulse w-20"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <div className="w-9 h-9 bg-gray-300 rounded-full animate-pulse"></div>
                    <div className="w-9 h-9 bg-gray-300 rounded-full animate-pulse"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 bg-white border-t border-gray-200 flex items-center justify-between">
        <div className="h-4 bg-gray-300 rounded animate-pulse w-48"></div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-300 rounded animate-pulse"></div>
          <div className="w-8 h-8 bg-gray-300 rounded animate-pulse"></div>
          <div className="w-8 h-8 bg-gray-300 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoader;