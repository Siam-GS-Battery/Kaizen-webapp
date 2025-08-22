import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import apiService from '../services/apiService';
import sessionManager from '../utils/sessionManager';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    employeeId: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate input
    if (!formData.employeeId || !formData.password) {
      await Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบถ้วน',
        text: 'กรุณากรอกรหัสพนักงานและรหัสผ่าน',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#3b82f6'
      });
      setIsLoading(false);
      return;
    }

    try {
      // Clear any existing tokens before login attempt
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Call backend API for authentication
      const response = await apiService.post('/auth/login', {
        employeeId: formData.employeeId,
        password: formData.password
      });

      console.log('Login response:', response.data);

      if (response.data.success) {
        console.log('Login successful, extracting data...');
        const { token, user } = response.data.data;
        
        console.log('Token:', token);
        console.log('User:', user);
        
        // Check if user role is 'User' and block login
        if (user.role === 'User') {
          await Swal.fire({
            icon: 'error',
            title: 'ไม่สามารถเข้าสู่ระบบได้',
            text: 'รหัสพนักงานของคุณไม่มีสิทธิ์เข้าสู่ระบบ',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#ef4444'
          });
          setIsLoading(false);
          return;
        }
        
        // Store token in localStorage
        localStorage.setItem('token', token);
        
        // Store user data if needed
        localStorage.setItem('user', JSON.stringify(user));
        
        // Create session using sessionManager
        sessionManager.createSession(user.employeeId, rememberMe);
        
        console.log('Session created and data stored');
        
        await Swal.fire({
          icon: 'success',
          title: 'เข้าสู่ระบบสำเร็จ!',
          text: `ยินดีต้อนรับ ${user.firstName} ${user.lastName} (${user.role})`,
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true
        });
        
        console.log('Success alert shown, preparing to navigate...');
        console.log('User role:', user.role);
        
        // สำหรับ Supervisor, Manager หรือ Admin ให้เข้าสู่หน้า Tasklist
        if (user.role === 'Supervisor' || user.role === 'Manager' || user.role === 'Admin') {
          console.log('Navigating to /tasklist');
          navigate('/tasklist');
        } else {
          console.log('Navigating to /');
          navigate('/');
        }
      } else {
        console.log('Login failed - response.data.success is false');
        console.log('Response data:', response.data);
      }
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
      
      if (error.response?.status === 401) {
        errorMessage = 'รหัสพนักงานหรือรหัสผ่านไม่ถูกต้อง';
      } else if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      }
      
      await Swal.fire({
        icon: 'error',
        title: 'เข้าสู่ระบบไม่สำเร็จ',
        text: errorMessage,
        confirmButtonText: 'ลองใหม่',
        confirmButtonColor: '#ef4444'
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">KAIZEN SYSTEM</h1>
          <p className="text-gray-600">เข้าสู่ระบบเพื่อใช้งาน</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Employee ID Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                รหัสพนักงาน
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  placeholder="กรอกรหัสพนักงาน"
                  style={{ fontSize: '16px' }} // Prevent zoom on iOS
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                รหัสผ่าน
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  placeholder="กรอกรหัสผ่าน"
                  style={{ fontSize: '16px' }} // Prevent zoom on iOS
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m0 0l3.12 3.12M12 12l-3.12-3.12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                จดจำการเข้าสู่ระบบ
              </label>
            </div>

            {/* Demo Credentials */}
            {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-700">
                  <p className="font-semibold mb-1">ข้อมูลสำหรับทดสอบ:</p>
                  <p>รหัสพนักงาน: <span className="font-mono">241303</span></p>
                  <p>รหัสผ่าน: <span className="font-mono">123456</span></p>
                </div>
              </div>
            </div> */}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังเข้าสู่ระบบ...
                </div>
              ) : (
                'เข้าสู่ระบบ'
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ลืมรหัสผ่าน? 
              <a href="#" className="ml-1 text-blue-600 hover:text-blue-800 font-semibold">
                ติดต่อ IT Support
              </a>
            </p>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800 font-semibold text-sm transition-colors duration-200"
          >
            ← กลับสู่หน้าหลัก
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;