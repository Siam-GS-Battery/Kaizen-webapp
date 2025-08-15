import React from 'react';

const FormSkeletonLoader = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-gray-300 rounded animate-pulse w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-96"></div>
        </div>

        {/* Form sections skeleton */}
        <div className="space-y-6">
          {/* Section 1 */}
          <div>
            <div className="h-6 bg-gray-300 rounded animate-pulse w-48 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item}>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mb-2"></div>
                  <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2 */}
          <div>
            <div className="h-6 bg-gray-300 rounded animate-pulse w-48 mb-4"></div>
            <div className="space-y-4">
              {[1, 2].map((item) => (
                <div key={item}>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mb-2"></div>
                  <div className="h-20 bg-gray-100 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Image upload section */}
          <div>
            <div className="h-6 bg-gray-300 rounded animate-pulse w-48 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((item) => (
                <div key={item} className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                  <div className="h-32 bg-gray-100 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mx-auto mt-4"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Button skeleton */}
          <div className="flex justify-center mt-8">
            <div className="h-12 bg-blue-300 rounded animate-pulse w-32"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormSkeletonLoader;