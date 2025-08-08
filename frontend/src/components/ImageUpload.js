import React, { useState } from 'react';

const ImageUpload = ({ 
  onImageSelect, 
  currentImage, 
  label, 
  acceptedFormats = "image/jpeg,image/png,image/webp",
  maxSizeMB = 5,
  id,
  required = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(currentImage || null);
  const [error, setError] = useState('');

  const validateFile = (file) => {
    // Check file type
    const validTypes = acceptedFormats.split(',').map(type => type.trim());
    if (!validTypes.includes(file.type)) {
      return `รูปแบบไฟล์ไม่ถูกต้อง กรุณาใช้ ${acceptedFormats}`;
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `ขนาดไฟล์เกิน ${maxSizeMB}MB กรุณาเลือกไฟล์ที่เล็กกว่า`;
    }

    return null;
  };

  const handleFileChange = (file) => {
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target.result;
      setPreview(result);
      onImageSelect(file, result);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    handleFileChange(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileChange(files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const clearImage = () => {
    setPreview(null);
    setError('');
    onImageSelect(null, null);
    // Reset file input
    const input = document.getElementById(id);
    if (input) input.value = '';
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div
        className={`relative border-2 border-dashed rounded-lg p-4 transition-colors ${
          dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : error
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-md"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
            >
              ×
            </button>
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
              คลิกเพื่อเปลี่ยนรูป
            </div>
          </div>
        ) : (
          <div className="text-center">
            <svg 
              className="mx-auto h-12 w-12 text-gray-400" 
              stroke="currentColor" 
              fill="none" 
              viewBox="0 0 48 48"
            >
              <path 
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
                strokeWidth={2} 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </svg>
            <div className="mt-4">
              <label
                htmlFor={id}
                className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                เลือกรูปภาพ
              </label>
              <p className="mt-2 text-xs text-gray-500">
                หรือลากรูปภาพมาวางที่นี่
              </p>
              <p className="text-xs text-gray-400 mt-1">
                รองรับ: JPEG, PNG, WebP (สูงสุด {maxSizeMB}MB)
              </p>
            </div>
          </div>
        )}

        <input
          id={id}
          type="file"
          className="hidden"
          accept={acceptedFormats}
          onChange={handleInputChange}
        />
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default ImageUpload;