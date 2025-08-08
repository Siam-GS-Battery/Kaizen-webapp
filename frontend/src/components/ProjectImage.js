import React, { useState, useRef, useEffect } from 'react';

const ProjectImage = ({ 
  src, 
  alt, 
  className = "w-full h-48 object-cover rounded-lg shadow-sm cursor-pointer hover:opacity-75 transition-opacity",
  showClickHint = true,
  onError,
  fallbackSrc
}) => {
  const [imageStatus, setImageStatus] = useState('loading'); // loading, loaded, error
  const [currentSrc, setCurrentSrc] = useState(src);
  const imageRef = useRef(null);

  // Reset state when src changes
  useEffect(() => {
    if (src !== currentSrc) {
      setCurrentSrc(src);
      setImageStatus('loading');
    }
  }, [src]);

  const handleImageLoad = () => {
    setImageStatus('loaded');
  };

  const handleImageError = (error) => {
    // Only log error if it's not a fallback attempt
    if (currentSrc === src) {
      console.warn('Image load failed:', error);
    }
    
    // Try fallback source first
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      return;
    }
    
    // If the URL contains project-images with folder structure, try fixing it
    if (currentSrc === src && currentSrc.includes('/project-images/') && currentSrc.match(/\/project-images\/\d+\//)) {
      console.log('Attempting to fix malformed Supabase URL:', currentSrc);
      // Remove the project ID folder from the path
      const fixedUrl = currentSrc.replace(/\/project-images\/\d+\//, '/project-images/');
      setCurrentSrc(fixedUrl);
      return;
    }
    
    setImageStatus('error');
    if (onError) {
      onError(error);
    }
  };

  const handleClick = () => {
    if (imageStatus === 'loaded' && currentSrc) {
      // Check if it's a base64 image
      if (currentSrc.startsWith('data:image')) {
        // For base64 images, open in new tab with blob URL
        try {
          const byteCharacters = atob(currentSrc.split(',')[1]);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], {type: 'image/jpeg'});
          const url = URL.createObjectURL(blob);
          window.open(url, '_blank');
        } catch (error) {
          console.warn('Error opening base64 image:', error);
        }
      } else {
        // For URLs, try to open directly
        window.open(currentSrc, '_blank');
      }
    }
  };

  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center h-48 bg-gray-100 rounded-lg">
      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
      <p className="text-sm text-gray-500">กำลังโหลดรูปภาพ...</p>
    </div>
  );

  const renderErrorState = () => (
    <div className="flex flex-col items-center justify-center h-48 bg-red-50 border-2 border-dashed border-red-200 rounded-lg">
      <svg className="w-12 h-12 text-red-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-sm text-red-600 text-center px-2">
        ไม่สามารถโหลดรูปภาพได้
      </p>
      <p className="text-xs text-red-500 text-center px-2 mt-1">
        อาจเป็นเพราะปัญหาการเชื่อมต่อหรือไฟล์ถูกลบ
      </p>
    </div>
  );

  if (!currentSrc) {
    return renderErrorState();
  }

  if (imageStatus === 'loading') {
    return (
      <div>
        {renderLoadingState()}
        <img
          ref={imageRef}
          src={currentSrc}
          alt={alt}
          className="hidden"
          onLoad={handleImageLoad}
          onError={handleImageError}
          crossOrigin="anonymous"
        />
      </div>
    );
  }

  if (imageStatus === 'error') {
    return renderErrorState();
  }

  return (
    <div className="relative">
      <img 
        ref={imageRef}
        src={currentSrc} 
        alt={alt} 
        className={className}
        onClick={handleClick}
        onError={handleImageError}
        crossOrigin="anonymous"
      />
      {showClickHint && (
        <div className="absolute bottom-2 right-2 bg-blue-600 bg-opacity-80 text-white px-2 py-1 rounded text-xs">
          คลิกเพื่อดูขนาดเต็ม
        </div>
      )}
    </div>
  );
};

export default ProjectImage;