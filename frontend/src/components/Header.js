import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // ฟังก์ชันเช็ค active
  const isActive = (path) => location.pathname === path;

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
              className={`text-blue-600 font-medium transition-colors pb-1 ${isActive('/') ? 'border-b-2 border-blue-600' : 'hover:text-blue-800'}`}
            >
              HOME
            </a>
            <a 
              href="/search-history" 
              className={`transition-colors pb-1 ${isActive('/search-history') ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
            >
              SEARCH HISTORY
            </a>
            <button className="border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-600 hover:text-white transition-colors">
              LOGIN
            </button>
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
                className={`font-medium transition-colors ${isActive('/') ? 'border-b-2 border-blue-600 text-blue-600' : 'text-blue-600 hover:text-blue-800'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                HOME
              </a>
              <a 
                href="/search-history" 
                className={`transition-colors ${isActive('/search-history') ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                SEARCH HISTORY
              </a>
              <button 
                className="border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-600 hover:text-white transition-colors text-left"
                onClick={() => setIsMenuOpen(false)}
              >
                LOGIN
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;