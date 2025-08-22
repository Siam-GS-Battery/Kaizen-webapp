import React, { useState, useEffect } from 'react';
import sessionManager from '../utils/sessionManager';

const SessionWarningModal = ({ isOpen, onExtend, onLogout, remainingTime }) => {
  const [timeLeft, setTimeLeft] = useState(remainingTime);
  const [isExtending, setIsExtending] = useState(false);

  useEffect(() => {
    if (isOpen && remainingTime > 0) {
      setTimeLeft(remainingTime);
      
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = Math.max(0, prev - 1000);
          if (newTime <= 0) {
            clearInterval(interval);
            // Call onLogout immediately when time expires
            onLogout();
          }
          return newTime;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOpen, remainingTime, onLogout]);

  const handleExtend = async () => {
    setIsExtending(true);
    try {
      const success = sessionManager.extendSession();
      if (success) {
        onExtend();
      } else {
        // Can't extend anymore, logout immediately
        onLogout();
      }
    } catch (error) {
      console.error('Error extending session:', error);
      onLogout();
    } finally {
      setIsExtending(false);
    }
  };

  const formatTime = (timeInMs) => {
    const minutes = Math.floor(timeInMs / (1000 * 60));
    const seconds = Math.floor((timeInMs % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const sessionInfo = sessionManager.getSessionInfo();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">
              เซสชั่นใกล้หมดเวลา
            </h3>
            <p className="text-sm text-gray-600">
              ระบบจะออกจากระบบอัตโนมัติ
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">เวลาที่เหลือ:</span>
              <span className="text-2xl font-bold text-red-600 font-mono">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm mb-4">
            เซสชั่นของคุณจะหมดอายุในอีกไม่กี่นาที คุณต้องการขยายเวลาการใช้งานหรือไม่?
          </p>

          {sessionInfo && (
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">จำนวนครั้งที่ขยายแล้ว:</span>
                <span className="font-semibold">
                  {sessionInfo.extensionCount}/{sessionInfo.maxExtensions}
                </span>
              </div>
              {!sessionInfo.canExtend && (
                <p className="text-red-600 text-xs mt-2">
                  * คุณได้ขยายเวลาครบจำนวนสูงสุดแล้ว
                </p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={onLogout}
            className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
          >
            ออกจากระบบ
          </button>
          
          <button
            onClick={handleExtend}
            disabled={isExtending || !sessionInfo?.canExtend}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isExtending ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังขยายเวลา...
              </div>
            ) : (
              `ขยายเวลา (${sessionInfo?.canExtend ? sessionInfo.maxExtensions - sessionInfo.extensionCount : 0} ครั้ง)`
            )}
          </button>
        </div>

        {/* Additional info */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          <span>
            การขยายเวลาจะเพิ่มเวลาการใช้งานอีก 30 นาที
          </span>
        </div>
      </div>
    </div>
  );
};

export default SessionWarningModal;