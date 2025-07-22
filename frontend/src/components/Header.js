import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { employeeData } from '../data/employeeData';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOperationsOpen, setIsOperationsOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
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
      }
    }
  }, []);

  // ปิด Operations dropdown เมื่อคลิกนอกเมนู
  useEffect(() => {
    const handleClickOutside = () => {
      setIsOperationsOpen(false);
    };
    
    if (isOperationsOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOperationsOpen]);

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

  return (
    <header className="bg-white text-blue-600 shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="text-lg sm:text-xl font-semibold text-blue-600">
            KAIZEN ONLINE SYSTEM
          </div>
          
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
            
            <a 
              href="/login" 
              className="border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-600 hover:text-white transition-colors"
            >
              LOGIN
            </a>
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
                  <div className="font-medium text-blue-600 text-sm uppercase tracking-wider">
                    OPERATIONS
                  </div>
                  {getOperationsMenuItems().map((item, index) => (
                    <a
                      key={index}
                      href={item.href}
                      className="block pl-4 py-2 text-gray-600 hover:text-blue-600 transition-colors border-l-2 border-gray-200 hover:border-blue-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              )}
              
              <a 
                href="/login"
                className="border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-600 hover:text-white transition-colors text-left"
                onClick={() => setIsMenuOpen(false)}
              >
                LOGIN
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;