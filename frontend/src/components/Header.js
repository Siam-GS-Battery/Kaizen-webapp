import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { employeeData } from '../data/employeeData';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOperationsOpen, setIsOperationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileOperationsOpen, setIsMobileOperationsOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  // ฟังก์ชันเช็ค active
  const isActive = (path) => location.pathname === path;

  // ตรวจสอบสิทธิ์ผู้ใช้จาก localStorage
  useEffect(() => {
    const userSession = localStorage.getItem('userSession');
    if (userSession) {
      const session = JSON.parse(userSession);
      const employee = employeeData.find(emp => emp.รหัสพนักงาน === session.รหัสพนักงาน);
      if (employee) {
        setUserRole(employee.สิทธิ์);
        setCurrentUser(employee);
        setIsLoggedIn(true);
      }
    } else {
      setUserRole(null);
      setCurrentUser(null);
      setIsLoggedIn(false);
    }
  }, []);

  // ปิด dropdowns เมื่อคลิกนอกเมนู
  useEffect(() => {
    const handleClickOutside = () => {
      setIsOperationsOpen(false);
      setIsUserMenuOpen(false);
    };
    
    if (isOperationsOpen || isUserMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOperationsOpen, isUserMenuOpen]);

  // เมนูสำหรับ Operations ตามสิทธิ์
  const getOperationsMenuItems = () => {
    if (userRole === 'Supervisor') {
      return [
        { name: 'Tasklist', href: '/tasklist' }
      ];
    } else if (userRole === 'Admin') {
      return [
        { name: 'Tasklist', href: '/tasklist' },
        { name: 'Employees Management', href: '/employees-management' },
        { name: 'Admin Team Setting', href: '/admin-team-setting' },
        { name: 'Report Page', href: '/report-page' }
      ];
    }
    return [];
  };

  // ฟังก์ชัน logout
  const handleLogout = () => {
    localStorage.removeItem('userSession');
    setUserRole(null);
    setCurrentUser(null);
    setIsLoggedIn(false);
    setIsUserMenuOpen(false);
    // รีเฟรชหน้าเพื่อรีเซ็ตสถานะทั้งหมด
    window.location.reload();
  };

  return (
    <header className="bg-white text-blue-600 shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex justify-between items-center">
          <a href="/" className="text-lg sm:text-xl font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer">
            KAIZEN ONLINE SYSTEM
          </a>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a 
              href="/" 
              className={`font-medium transition-colors pb-1 ${isActive('/') ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-blue-800'}`}
            >
              HOME
            </a>
            <a 
              href="/search-history" 
              className={`font-medium transition-colors pb-1 ${isActive('/search-history') ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
            >
              SEARCH HISTORY
            </a>
            
            {/* Operations Dropdown - แสดงเฉพาะ Supervisor และ Admin */}
            {(userRole === 'Supervisor' || userRole === 'Admin') && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOperationsOpen(!isOperationsOpen);
                  }}
                  className={`font-medium transition-colors pb-1 flex items-center gap-1 ${
                    location.pathname.includes('/tasklist') || 
                    location.pathname.includes('/employees-management') || 
                    location.pathname.includes('/admin-team-setting') || 
                    location.pathname.includes('/report-page')
                      ? 'border-b-2 border-blue-600 text-blue-600' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  OPERATIONS
                  <svg className={`w-4 h-4 transition-transform ${isOperationsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                {isOperationsOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {getOperationsMenuItems().map((item, index) => (
                      <a
                        key={index}
                        href={item.href}
                        className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
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
                    setIsUserMenuOpen(!isUserMenuOpen);
                  }}
                  className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg border border-blue-200 transition-colors"
                >
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="font-medium">{currentUser.ชื่อ} {currentUser.นามสกุล}</span>
                  <svg className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        <div>
                          <div className="font-semibold text-gray-800">{currentUser.ชื่อ} {currentUser.นามสกุล}</div>
                          <div className="text-sm text-gray-500">{currentUser.รหัสพนักงาน}</div>
                          <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full inline-block mt-1">{currentUser.สิทธิ์}</div>
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
                className="border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-600 hover:text-white transition-colors"
              >
                LOGIN
              </a>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden flex items-center space-x-2 text-blue-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            <div className="flex flex-col space-y-4">
              <a 
                href="/" 
                className={`font-medium transition-colors ${isActive('/') ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-blue-800'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                HOME
              </a>
              <a 
                href="/search-history" 
                className={`font-medium transition-colors ${isActive('/search-history') ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                SEARCH HISTORY
              </a>
              
              {/* Operations Section for Mobile - แสดงเฉพาะ Supervisor และ Admin */}
              {(userRole === 'Supervisor' || userRole === 'Admin') && (
                <div className="space-y-2">
                  <button
                    onClick={() => setIsMobileOperationsOpen(!isMobileOperationsOpen)}
                    className="flex items-center justify-between w-full font-medium text-blue-600 text-sm uppercase tracking-wider hover:text-blue-800 transition-colors"
                  >
                    <span>OPERATIONS</span>
                    <svg className={`w-4 h-4 transition-transform ${isMobileOperationsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isMobileOperationsOpen && (
                    <div className="space-y-1">
                      {getOperationsMenuItems().map((item, index) => (
                        <a
                          key={index}
                          href={item.href}
                          className="block pl-4 py-2 text-sm text-gray-600 hover:text-blue-600 transition-colors border-l-2 border-gray-200 hover:border-blue-600"
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
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-blue-800">{currentUser.ชื่อ} {currentUser.นามสกุล}</div>
                        <div className="text-sm text-blue-600">{currentUser.รหัสพนักงาน}</div>
                        <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full inline-block mt-1">{currentUser.สิทธิ์}</div>
                      </div>
                    </div>
                    
                    {/* Mobile Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      ออกจากระบบ
                    </button>
                  </div>
                </div>
              ) : (
                <a 
                  href="/login"
                  className="border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-600 hover:text-white transition-colors text-left"
                  onClick={() => setIsMenuOpen(false)}
                >
                  LOGIN
                </a>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;