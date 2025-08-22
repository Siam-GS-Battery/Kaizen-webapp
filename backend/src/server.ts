import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

import { supabase, supabaseAdmin, TABLES } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
// import StorageService from './services/storageService'; // Disconnected storage

// Routes
import authRoutes from './routes/auth';
import tasklistRoutes from './routes/tasklist';
import employeeRoutes from './routes/employee';
import uploadRoutes from './routes/upload';
import reportsRoutes from './routes/reports';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for accurate client IP detection (required for rate limiting)
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(compression());
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Kaizen Backend API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test Supabase connection and display users data
app.get('/api/test-db', async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('id');
    
    if (error) throw error;
    
    res.json({ 
      status: 'OK', 
      message: 'Database connection successful',
      timestamp: new Date().toISOString(),
      users: users,
      userCount: users?.length || 0
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasklist', tasklistRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reports', reportsRoutes);

// API info
app.get('/api', (_req, res) => {
  res.json({ 
    message: 'Welcome to Kaizen API',
    version: '1.0.0',
    storage: 'Supabase Storage Integration',
    endpoints: [
      'GET /api/health - Health check',
      'GET /api/test-db - Database connection test',
      'POST /api/auth/login - User login',
      'POST /api/auth/logout - User logout',
      'GET /api/auth/verify - Verify token',
      'GET /api/employees - Get all employees',
      'GET /api/employees/:id - Get employee by ID',
      'POST /api/employees - Create employee (Admin)',
      'PUT /api/employees/:id - Update employee (Admin)',
      'DELETE /api/employees/:id - Delete employee (Admin)',
      'GET /api/tasklist - Get all tasks with filters',
      'GET /api/tasklist/:id - Get task by ID',
      'POST /api/tasklist - Create new task',
      'PUT /api/tasklist/:id - Update task',
      'DELETE /api/tasklist/:id - Delete task',
      'POST /api/upload/single - Upload single project image',
      'POST /api/upload/multiple - Upload multiple project images',
      'GET /api/upload/project/:projectId/images - Get project images',
      'DELETE /api/upload/project/:projectId/image/:imageType - Delete project image',
      'GET /api/upload/stats - Get storage statistics (Admin)',
      'GET /api/reports/monthly - Get monthly reports data',
      'GET /api/reports/yearly - Get yearly summary'
    ]
  });
});

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Function to display users table in console
async function displayUsersTable() {
  try {
    console.log('\n📋 USERS TABLE DATA:');
    console.log('=' .repeat(100));
    
    const client = supabaseAdmin || supabase;
    const { data: users, error } = await client
      .from(TABLES.USERS)
      .select('*')
      .order('id');
    
    if (error) {
      console.error('❌ Error fetching users:', error.message);
      return;
    }

    if (!users || users.length === 0) {
      console.log('⚠️  No users found in the database');
      return;
    }

    console.log(`📊 Total Users: ${users.length}\n`);
    
    // Display table header
    console.log('ID'.padEnd(4) + 
                'Employee ID'.padEnd(12) + 
                'Name'.padEnd(25) + 
                'Department'.padEnd(10) + 
                'Role'.padEnd(12) + 
                'Active'.padEnd(8) + 
                'Created');
    console.log('-'.repeat(100));
    
    // Display each user
    users.forEach(user => {
      const fullName = `${user.first_name} ${user.last_name}`;
      const createdDate = new Date(user.created_at).toLocaleDateString('th-TH');
      
      console.log(
        String(user.id).padEnd(4) +
        user.employee_id.padEnd(12) +
        fullName.padEnd(25) +
        user.department.padEnd(10) +
        user.role.padEnd(12) +
        (user.is_active ? '✅' : '❌').padEnd(8) +
        createdDate
      );
    });
    
    console.log('=' .repeat(100));
    console.log('✅ Users table displayed successfully\n');
    
  } catch (error) {
    console.error('❌ Failed to display users table:', error);
  }
}

app.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
  
  // Storage initialization disconnected
  console.log('📦 Storage initialization skipped');
  
  // Display users table on startup
  await displayUsersTable();
});

export default app;