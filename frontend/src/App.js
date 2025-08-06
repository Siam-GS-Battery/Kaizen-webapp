import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import GenbaForm from './pages/GenbaForm';
import SuggestionForm from './pages/SuggestionForm';
import EditForm from './pages/EditForm';
import SearchHistory from './pages/SearchHistory';
import Tasklist from './pages/Tasklist';
import EmployeesManagement from './pages/EmployeesManagement';
import AdminTeamSettings from './pages/AdminTeamSettings';
import Report from './pages/Report';
import Login from './pages/Login';
import Header from './components/Header';
import Footer from './components/Footer';
import sessionManager from './utils/sessionManager';

// Protected routes that require authentication
const protectedRoutes = ['/tasklist', '/employees-management', '/admin-team-settings', '/report'];

// Routes that require specific roles
const roleProtectedRoutes = {
  '/tasklist': ['Supervisor', 'Manager', 'Admin'],
  '/employees-management': ['Admin'],
  '/admin-team-settings': ['Admin'],  
  '/report': ['Admin']
};

function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoginPage = location.pathname === '/login';

  // Session protection effect
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Skip protection for login page and home page
    if (currentPath === '/login' || currentPath === '/') {
      return;
    }

    // Check if current route requires authentication
    const isProtectedRoute = protectedRoutes.includes(currentPath);
    
    if (isProtectedRoute) {
      const session = sessionManager.getCurrentSession();
      
      if (!session || !sessionManager.isSessionValid()) {
        // Session invalid, redirect to login
        sessionManager.destroySession();
        navigate('/login');
        return;
      }

      // Check role-based access
      const requiredRoles = roleProtectedRoutes[currentPath];
      if (requiredRoles) {
        // Get user role from localStorage
        const userDataStr = localStorage.getItem('user');
        let userRole = null;
        
        if (userDataStr) {
          try {
            const userData = JSON.parse(userDataStr);
            userRole = userData.role;
          } catch (error) {
            console.error('Error parsing user data:', error);
          }
        }
        
        if (!userRole || !requiredRoles.includes(userRole)) {
          // Insufficient permissions, redirect to home
          alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
          navigate('/');
          return;
        }
      }
    }
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {!isLoginPage && <Header />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/genba-form" element={<GenbaForm />} />
          <Route path="/suggestion-form" element={<SuggestionForm />} />
          <Route path="/edit-form/:id" element={<EditForm />} />
          <Route path="/search-history" element={<SearchHistory />} />
          <Route path="/tasklist" element={<Tasklist />} />
          <Route path="/employees-management" element={<EmployeesManagement />} />
          <Route path="/admin-team-settings" element={<AdminTeamSettings />} />
          <Route path="/report" element={<Report />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
      {!isLoginPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router 
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AppLayout />
    </Router>
  );
}

export default App;