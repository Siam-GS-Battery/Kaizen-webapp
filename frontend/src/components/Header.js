import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { employeeData } from '../data/employeeData';
import sessionManager from '../utils/sessionManager';
import SessionWarningModal from './SessionWarningModal';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOperationsOpen, setIsOperationsOpen] = useState(false);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileOperationsOpen, setIsMobileOperationsOpen] = useState(false);
  const [isMobileCreateFormOpen, setIsMobileCreateFormOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [warningTime, setWarningTime] = useState(0);
  const [sessionInfo, setSessionInfo] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // ฟังก์ชันเช็ค active
  const isActive = (path) => location.pathname === path;

  // ตรวจสอบสิทธิ์ผู้ใช้และตั้งค่า session monitoring
  useEffect(() => {
    const checkSession = () => {
      const session = sessionManager.getCurrentSession();
      if (session && sessionManager.isSessionValid()) {
        const employee = employeeData.find(emp => emp.employeeId === session.employeeId);
        if (employee) {
          setUserRole(employee.role);
          setCurrentUser(employee);
          setIsLoggedIn(true);
          setSessionInfo(sessionManager.getSessionInfo());
        }
      } else {
        setUserRole(null);
        setCurrentUser(null);
        setIsLoggedIn(false);
        setSessionInfo(null);
      }
    };

    // Initial check
    checkSession();

    // Set up session warning handler (expired handler is set globally in App.js)
    const currentHandlers = {
      onExpired: handleSessionExpired,
      onWarning: (remainingTime) => {
        setWarningTime(remainingTime);
        setShowSessionWarning(true);
      },
      onExtended: () => {
        setShowSessionWarning(false);
        checkSession();
      }
    };

    sessionManager.setEventHandlers(currentHandlers);

    // Set up interval to update session info
    const sessionInfoInterval = setInterval(() => {
      if (sessionManager.isSessionValid()) {
        setSessionInfo(sessionManager.getSessionInfo());
      }
    }, 10000); // Update every 10 seconds

    return () => {
      clearInterval(sessionInfoInterval);
    };
  }, []);

  // ปิด dropdowns เมื่อคลิกนอกเมนู
  useEffect(() => {
    const handleClickOutside = () => {
      setIsOperationsOpen(false);
      setIsCreateFormOpen(false);
      setIsUserMenuOpen(false);
    };
    
    if (isOperationsOpen || isCreateFormOpen || isUserMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOperationsOpen, isCreateFormOpen, isUserMenuOpen]);

  // เมนูสำหรับ Operations ตามสิทธิ์
  const getOperationsMenuItems = () => {
    if (userRole === 'Supervisor' || userRole === 'Manager') {
      return [
        { name: 'Tasklist', href: '/tasklist' }
      ];
    } else if (userRole === 'Admin') {
      return [
        { name: 'Tasklist', href: '/tasklist' },
        { name: 'Employees Management', href: '/employees-management' },
        { name: 'Admin Team Settings', href: '/admin-team-settings' },
        { name: 'Report Page', href: '/report' }
      ];
    }
    return [];
  };

  // เมนูสำหรับ Create Form ตามสิทธิ์
  const getCreateFormMenuItems = () => {
    if (userRole === 'Supervisor' || userRole === 'Manager' || userRole === 'Admin') {
      return [
        { name: 'Genba Form', href: '/genba-form' },
        { name: 'Suggestion Form', href: '/suggestion-form' }
      ];
    }
    return [];
  };

  // ฟังก์ชัน session expired
  const handleSessionExpired = () => {
    sessionManager.destroySession();
    setUserRole(null);
    setCurrentUser(null);
    setIsLoggedIn(false);
    setShowSessionWarning(false);
    setSessionInfo(null);
    
    // Redirect to login immediately without alert
    navigate('/login', { replace: true });
  };

  // ฟังก์ชัน logout
  const handleLogout = () => {
    sessionManager.destroySession();
    setUserRole(null);
    setCurrentUser(null);
    setIsLoggedIn(false);
    setIsUserMenuOpen(false);
    setShowSessionWarning(false);
    setSessionInfo(null);
    // กลับเข้าสู่หน้าหลัก home
    window.location.href = '/';
  };

  // ฟังก์ชัน extend session
  const handleExtendSession = () => {
    setShowSessionWarning(false);
    const success = sessionManager.extendSession();
    if (success) {
      setSessionInfo(sessionManager.getSessionInfo());
    } else {
      handleSessionExpired();
    }
  };

  return (
    <header className="bg-white text-blue-600 shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <a href="/" className="text-base sm:text-lg lg:text-xl font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer truncate">
            KAIZEN ONLINE SYSTEM
          </a>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            <a 
              href="/" 
              className={`font-medium transition-colors pb-1 text-sm xl:text-base ${isActive('/') ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-blue-800'}`}
            >
              HOME
            </a>
            <a 
              href="/search-history" 
              className={`font-medium transition-colors pb-1 text-sm xl:text-base ${isActive('/search-history') ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
            >
              SEARCH HISTORY
            </a>
            
            {/* Create Form Dropdown - แสดงเฉพาะ Supervisor, Manager และ Admin */}
            {(userRole === 'Supervisor' || userRole === 'Manager' || userRole === 'Admin') && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // ปิด dropdown อื่นๆ ก่อนเปิดใหม่
                    setIsOperationsOpen(false);
                    setIsUserMenuOpen(false);
                    setIsCreateFormOpen(!isCreateFormOpen);
                  }}
                  className={`font-medium transition-colors pb-1 flex items-center gap-1 text-sm xl:text-base ${
                    location.pathname.includes('/gen-form') || 
                    location.pathname.includes('/suggestion-form')
                      ? 'border-b-2 border-blue-600 text-blue-600' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  CREATE FORM
                  <svg className={`w-3 h-3 xl:w-4 xl:h-4 transition-transform ${isCreateFormOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                {isCreateFormOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 xl:w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {getCreateFormMenuItems().map((item, index) => (
                      <a
                        key={index}
                        href={item.href}
                        className="block px-3 xl:px-4 py-2 text-sm xl:text-base text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        onClick={() => setIsCreateFormOpen(false)}
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Operations Dropdown - แสดงเฉพาะ Supervisor, Manager และ Admin */}
            {(userRole === 'Supervisor' || userRole === 'Manager' || userRole === 'Admin') && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // ปิด dropdown อื่นๆ ก่อนเปิดใหม่
                    setIsCreateFormOpen(false);
                    setIsUserMenuOpen(false);
                    setIsOperationsOpen(!isOperationsOpen);
                  }}
                  className={`font-medium transition-colors pb-1 flex items-center gap-1 text-sm xl:text-base ${
                    location.pathname.includes('/tasklist') || 
                    location.pathname.includes('/employees-management') || 
                    location.pathname.includes('/admin-team-settings') || 
                    location.pathname.includes('/report-page')
                      ? 'border-b-2 border-blue-600 text-blue-600' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  OPERATIONS
                  <svg className={`w-3 h-3 xl:w-4 xl:h-4 transition-transform ${isOperationsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                {isOperationsOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 xl:w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {getOperationsMenuItems().map((item, index) => (
                      <a
                        key={index}
                        href={item.href}
                        className="block px-3 xl:px-4 py-2 text-sm xl:text-base text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        onClick={() => setIsOperationsOpen(false)}
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Login/User Menu */}
            {isLoggedIn && currentUser ? (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // ปิด dropdown อื่นๆ ก่อนเปิดใหม่
                    setIsCreateFormOpen(false);
                    setIsOperationsOpen(false);
                    setIsUserMenuOpen(!isUserMenuOpen);
                  }}
                  className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 xl:px-4 py-2 rounded-lg border border-blue-200 transition-colors"
                >
                  <div className="w-5 h-5 xl:w-6 xl:h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 xl:w-4 xl:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="font-medium text-sm xl:text-base truncate max-w-24 xl:max-w-32">{currentUser.firstName} {currentUser.lastName}</span>
                  <svg className={`w-3 h-3 xl:w-4 xl:h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-gray-800 truncate">{currentUser.firstName} {currentUser.lastName}</div>
                          <div className="text-sm text-gray-500">{currentUser.employeeId}</div>
                          <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full inline-block mt-1">{currentUser.role}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      ออกจากระบบ
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <a 
                href="/login" 
                className="border border-blue-600 text-blue-600 px-3 xl:px-4 py-2 rounded hover:bg-blue-600 hover:text-white transition-colors text-sm xl:text-base"
              >
                LOGIN
              </a>
            )}
          </nav>

          {/* Tablet Navigation (Medium screens) */}
          <nav className="hidden md:flex lg:hidden items-center space-x-3">
            <a 
              href="/" 
              className={`font-medium transition-colors pb-1 text-sm ${isActive('/') ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-blue-800'}`}
            >
              HOME
            </a>
            <a 
              href="/search-history" 
              className={`font-medium transition-colors pb-1 text-sm ${isActive('/search-history') ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
            >
              SEARCH
            </a>
            
            {/* Login/User Menu for Tablet */}
            {isLoggedIn && currentUser ? (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // ปิด dropdown อื่นๆ ก่อนเปิดใหม่ (สำหรับ tablet)
                    setIsCreateFormOpen(false);
                    setIsOperationsOpen(false);
                    setIsUserMenuOpen(!isUserMenuOpen);
                  }}
                  className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg border border-blue-200 transition-colors"
                >
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="font-medium text-sm truncate max-w-20">{currentUser.firstName}</span>
                  <svg className={`w-3 h-3 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-gray-800 truncate">{currentUser.firstName} {currentUser.lastName}</div>
                          <div className="text-sm text-gray-500">{currentUser.employeeId}</div>
                          <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full inline-block mt-1">{currentUser.role}</div>
                        </div>
                      </div>
                    </div>
                    
                                         {/* Menu Items for Tablet */}
                     {(userRole === 'Supervisor' || userRole === 'Manager' || userRole === 'Admin') && (
                      <>
                        <div className="px-4 py-2 border-b border-gray-100">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">CREATE FORM</div>
                          {getCreateFormMenuItems().map((item, index) => (
                            <a
                              key={index}
                              href={item.href}
                              className="block py-1 text-sm text-gray-700 hover:text-blue-600 transition-colors"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              {item.name}
                            </a>
                          ))}
                        </div>
                        <div className="px-4 py-2 border-b border-gray-100">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">OPERATIONS</div>
                          {getOperationsMenuItems().map((item, index) => (
                            <a
                              key={index}
                              href={item.href}
                              className="block py-1 text-sm text-gray-700 hover:text-blue-600 transition-colors"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              {item.name}
                            </a>
                          ))}
                        </div>
                      </>
                    )}
                    
                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      ออกจากระบบ
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <a 
                href="/login" 
                className="border border-blue-600 text-blue-600 px-3 py-2 rounded hover:bg-blue-600 hover:text-white transition-colors text-sm"
              >
                LOGIN
              </a>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden flex items-center justify-center w-10 h-10 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            <div className="flex flex-col space-y-3">
              <a 
                href="/" 
                className={`font-medium transition-colors py-2 px-3 rounded-lg ${isActive('/') ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' : 'text-gray-600 hover:text-blue-800 hover:bg-gray-50'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                HOME
              </a>
              <a 
                href="/search-history" 
                className={`font-medium transition-colors py-2 px-3 rounded-lg ${isActive('/search-history') ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                SEARCH HISTORY
              </a>
              
              {/* Create Form Section for Mobile - แสดงเฉพาะ Supervisor, Manager และ Admin */}
              {(userRole === 'Supervisor' || userRole === 'Manager' || userRole === 'Admin') && (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setIsMobileOperationsOpen(false); // ปิด Operations dropdown
                      setIsMobileCreateFormOpen(!isMobileCreateFormOpen);
                    }}
                    className="flex items-center justify-between w-full font-medium text-blue-600 text-sm uppercase tracking-wider hover:text-blue-800 transition-colors py-2 px-3 rounded-lg hover:bg-blue-50"
                  >
                    <span>CREATE FORM</span>
                    <svg className={`w-4 h-4 transition-transform ${isMobileCreateFormOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isMobileCreateFormOpen && (
                    <div className="space-y-1 ml-4">
                      {getCreateFormMenuItems().map((item, index) => (
                        <a
                          key={index}
                          href={item.href}
                          className="block py-2 px-3 text-sm text-gray-600 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-50 border-l-2 border-gray-200 hover:border-blue-600"
                          onClick={() => {
                            setIsMenuOpen(false);
                            setIsMobileCreateFormOpen(false);
                          }}
                        >
                          {item.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Operations Section for Mobile - แสดงเฉพาะ Supervisor, Manager และ Admin */}
              {(userRole === 'Supervisor' || userRole === 'Manager' || userRole === 'Admin') && (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setIsMobileCreateFormOpen(false); // ปิด Create Form dropdown
                      setIsMobileOperationsOpen(!isMobileOperationsOpen);
                    }}
                    className="flex items-center justify-between w-full font-medium text-blue-600 text-sm uppercase tracking-wider hover:text-blue-800 transition-colors py-2 px-3 rounded-lg hover:bg-blue-50"
                  >
                    <span>OPERATIONS</span>
                    <svg className={`w-4 h-4 transition-transform ${isMobileOperationsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isMobileOperationsOpen && (
                    <div className="space-y-1 ml-4">
                      {getOperationsMenuItems().map((item, index) => (
                        <a
                          key={index}
                          href={item.href}
                          className="block py-2 px-3 text-sm text-gray-600 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-50 border-l-2 border-gray-200 hover:border-blue-600"
                          onClick={() => {
                            setIsMenuOpen(false);
                            setIsMobileOperationsOpen(false);
                          }}
                        >
                          {item.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* Login/User Section for Mobile */}
              {isLoggedIn && currentUser ? (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  {/* User Info */}
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-blue-800 truncate">{currentUser.firstName} {currentUser.lastName}</div>
                        <div className="text-sm text-blue-600">{currentUser.employeeId}</div>
                        <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full inline-block mt-1">{currentUser.role}</div>
                      </div>
                    </div>
                    
                    {/* Mobile Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      ออกจากระบบ
                    </button>
                  </div>
                </div>
              ) : (
                <a 
                  href="/login"
                  className="border border-blue-600 text-blue-600 px-4 py-3 rounded-lg hover:bg-blue-600 hover:text-white transition-colors text-center font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  LOGIN
                </a>
              )}
            </div>
          </nav>
        )}
      </div>

      {/* Session Warning Modal */}
      <SessionWarningModal
        isOpen={showSessionWarning}
        onExtend={handleExtendSession}
        onLogout={handleLogout}
        remainingTime={warningTime}
      />
    </header>
  );
};

export default Header;