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
      // Log token info for debugging (only in development)
      if (process.env.NODE_ENV === 'development') {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const now = Math.floor(Date.now() / 1000);
          console.log('Token info:', {
            employeeId: payload.employeeId,
            expiresAt: new Date(payload.exp * 1000).toLocaleString(),
            isExpired: payload.exp < now
          });
        } catch (e) {
          console.warn('Invalid token format:', e);
        }
      }
    } else {
      console.warn('No token found in localStorage');
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
          console.warn('401 Unauthorized - Token expired or invalid, removing from localStorage');
          localStorage.removeItem('token');
          // Redirect to login if not already there
          if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
            window.location.href = '/login';
          }
          break;
        case 403:
          // Handle forbidden
          break;
        case 404:
          // Handle not found - could be bucket or resource issue
          if (error.response.data?.message?.includes('Bucket not found')) {
            console.warn('Storage bucket not found - this may be a Supabase configuration issue');
          }
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
  delete: (employeeId) => apiService.delete(`/employees/${employeeId}`),
  
  // Get users for dropdown
  getUsersForDropdown: () => apiService.get('/employees/dropdown/list'),
  
  // Kaizen Team Management
  getKaizenTeam: () => apiService.get('/employees/kaizen-team/list'),
  getNonKaizenTeam: () => apiService.get('/employees/non-kaizen-team/list'),
  addToKaizenTeam: (employeeId) => apiService.post(`/employees/${employeeId}/kaizen-team`),
  removeFromKaizenTeam: (employeeId) => apiService.delete(`/employees/${employeeId}/kaizen-team`)
};

// Tasklist API functions
export const tasklistAPI = {
  // Get all tasks with filters and pagination
  getAll: (params = {}) => {
    const queryString = new URLSearchParams();
    
    // Add parameters only if they have values
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryString.append(key, value);
      }
    });
    
    const url = `/tasklist${queryString.toString() ? '?' + queryString.toString() : ''}`;
    return apiService.get(url);
  },
  
  // Get task by ID
  getById: (taskId) => apiService.get(`/tasklist/${taskId}`),
  
  // Create new task
  create: (taskData) => apiService.post('/tasklist', taskData),
  
  // Update task
  update: (taskId, taskData) => apiService.put(`/tasklist/${taskId}`, taskData),
  
  // Delete task (soft delete - updates status to DELETED)
  delete: (taskId) => apiService.put(`/tasklist/${taskId}`, { status: 'DELETED' }),
  
  // Bulk approve tasks
  bulkApprove: (taskIds) => {
    return Promise.all(
      taskIds.map(id => apiService.put(`/tasklist/${id}`, { status: 'APPROVED' }))
    );
  },
  
  // Bulk delete tasks (soft delete)
  bulkDelete: (taskIds) => {
    return Promise.all(
      taskIds.map(id => apiService.put(`/tasklist/${id}`, { status: 'DELETED' }))
    );
  },

  // Get tasks filtered by hierarchy for Supervisor/Manager
  getHierarchyTasks: (userEmployeeId, params = {}) => {
    const queryString = new URLSearchParams();
    
    // Add parameters only if they have values
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryString.append(key, value);
      }
    });
    
    const url = `/tasklist/hierarchy/${userEmployeeId}${queryString.toString() ? '?' + queryString.toString() : ''}`;
    return apiService.get(url);
  }
};

// Reports API functions
export const reportsAPI = {
  // Get monthly reports data
  getMonthlyReports: (params = {}) => {
    const queryString = new URLSearchParams();
    
    // Add parameters only if they have values
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryString.append(key, value);
      }
    });
    
    const url = `/reports/monthly${queryString.toString() ? '?' + queryString.toString() : ''}`;
    return apiService.get(url);
  },
  
  // Get yearly summary
  getYearlySummary: (params = {}) => {
    const queryString = new URLSearchParams();
    
    // Add parameters only if they have values
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryString.append(key, value);
      }
    });
    
    const url = `/reports/yearly${queryString.toString() ? '?' + queryString.toString() : ''}`;
    return apiService.get(url);
  },
  
  // Get project data by month and type
  getProjectData: (params = {}) => {
    const queryString = new URLSearchParams();
    
    // Add parameters only if they have values
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryString.append(key, value);
      }
    });
    
    const url = `/reports/projects${queryString.toString() ? '?' + queryString.toString() : ''}`;
    return apiService.get(url);
  }
};

export default apiService; 