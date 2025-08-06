import axios from 'axios';

// Create an axios instance with default config
const apiService = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api', // Default to localhost with /api prefix
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor
apiService.interceptors.request.use(
  (config) => {
    // Get token from localStorage if it exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors here
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Handle unauthorized - just remove token
          localStorage.removeItem('token');
          break;
        case 403:
          // Handle forbidden
          break;
        case 404:
          // Handle not found
          break;
        case 500:
          // Handle server error
          break;
        default:
          break;
      }
    }
    return Promise.reject(error);
  }
);

// Employee API functions
export const employeeAPI = {
  // Get all employees
  getAll: () => apiService.get('/employees'),
  
  // Get employee by ID
  getById: (employeeId) => apiService.get(`/employees/${employeeId}`),
  
  // Create new employee (Admin only)
  create: (employeeData) => apiService.post('/employees', employeeData),
  
  // Update employee (Admin only)
  update: (employeeId, employeeData) => apiService.put(`/employees/${employeeId}`, employeeData),
  
  // Delete employee (Admin only)
  delete: (employeeId) => apiService.delete(`/employees/${employeeId}`)
};

export default apiService; 