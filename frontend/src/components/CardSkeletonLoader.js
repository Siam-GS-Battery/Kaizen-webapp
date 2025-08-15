import React from 'react';

const CardSkeletonLoader = ({ cards = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: cards }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6">
          {/* Card header */}
          <div className="mb-4">
            <div className="h-6 bg-gray-300 rounded animate-pulse w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>

          {/* Card content */}
          <div className="space-y-3">
            <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-100 rounded animate-pulse w-5/6"></div>
            <div className="h-4 bg-gray-100 rounded animate-pulse w-4/6"></div>
          </div>

          {/* Card footer */}
          <div className="mt-6 flex justify-between items-center">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-24"></div>
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardSkeletonLoader;