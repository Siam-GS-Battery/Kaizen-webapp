# Kaizen Web Application - Backend API

## 📋 Overview

Backend API สำหรับ Kaizen Web Application ที่พัฒนาด้วย Node.js, Express, TypeScript และ Supabase เพื่อจัดการข้อมูลโครงการ Kaizen, การจัดการผู้ใช้, และระบบอัปโหลดไฟล์

## 🏗️ Architecture

```
backend/
├── src/
│   ├── config/           # Database configuration
│   ├── middleware/       # Express middleware
│   ├── routes/          # API route handlers
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── server.ts        # Main server file
├── database/
│   ├── schema.sql       # Database schema
│   └── sample-data.sql  # Sample data insertion
├── uploads/             # File upload directory
├── .env.example         # Environment variables template
└── package.json         # Dependencies and scripts
```

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Joi
- **Development**: ts-node-dev, ESLint

## 📦 Features

### Core Features
- ✅ User Authentication & Authorization
- ✅ JWT Token Management
- ✅ Role-based Access Control (Admin, Manager, Supervisor, User)
- ✅ Project/Task CRUD Operations
- ✅ File Upload Management
- ✅ Session Tracking
- ✅ Input Validation
- ✅ Error Handling
- ✅ Rate Limiting
- ✅ Security Headers

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Verify token

#### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create employee (Admin only)
- `PUT /api/employees/:id` - Update employee (Admin only)
- `DELETE /api/employees/:id` - Delete employee (Admin only)

#### Tasks/Projects
- `GET /api/tasklist` - Get all tasks with filters & pagination
- `GET /api/tasklist/:id` - Get task by ID
- `POST /api/tasklist` - Create new task
- `PUT /api/tasklist/:id` - Update task
- `DELETE /api/tasklist/:id` - Delete task

#### File Upload
- `POST /api/upload/single` - Upload single file
- `POST /api/upload/multiple` - Upload multiple files
- `GET /api/upload/info/:filename` - Get file info
- `DELETE /api/upload/:filename` - Delete file
- `GET /api/upload` - List all files (Admin only)

#### Health Check
- `GET /api/health` - Health check
- `GET /api/test-db` - Database connection test

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ และ npm
- Supabase account และ project
- Git

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd Kaizen-webapp/backend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configurations
nano .env
```

### Step 4: Environment Variables
จัดการไฟล์ `.env` ด้วยข้อมูลต่อไปนี้:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_at_least_32_characters
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads
```

### Step 5: Supabase Database Setup

#### 5.1 Create Supabase Project
1. ไปที่ [Supabase Dashboard](https://supabase.com/dashboard)
2. คลิก "New Project"
3. กรอกข้อมูลโครงการและรอให้ database setup เสร็จ

#### 5.2 Setup Database Schema
1. เปิด SQL Editor ใน Supabase Dashboard
2. รันไฟล์ `database/schema.sql`:
```bash
# Copy content from database/schema.sql and paste in SQL Editor
```

#### 5.3 Insert Sample Data (Optional)
```bash
# Copy content from database/sample-data.sql and paste in SQL Editor
```

#### 5.4 Configure Row Level Security (RLS)
- RLS policies จะถูกสร้างอัตโนมัติจาก schema.sql
- ตรวจสอบว่า RLS ถูกเปิดใช้งานในตาราง users, projects, sessions, files

### Step 6: Start Development Server
```bash
# Development mode with hot reload
npm run dev

# Production build
npm run build
npm start
```

Server จะรันที่ `http://localhost:3001`

## 🔧 Database Schema

### Core Tables

#### users
- เก็บข้อมูลพนักงานและการตั้งค่าบทบาท
- Primary Key: `employee_id`
- Roles: Admin, Manager, Supervisor, User

#### projects
- เก็บข้อมูลโครงการ Kaizen ทั้งหมด
- รองรับ form types: genba, suggestion, best_kaizen
- Status: EDIT, WAITING, APPROVED, REJECTED

#### sessions
- ติดตาม user sessions สำหรับความปลอดภัย
- รองรับ concurrent sessions

#### files
- จัดการไฟล์ที่อัปโหลด
- เชื่อมโยงกับ projects

## 🔐 Authentication & Authorization

### JWT Token
- ใช้ JWT สำหรับ authentication
- Token มี expiry time ตาม JWT_EXPIRES_IN
- รวม user info: employeeId, role

### Role-based Access
- **Admin**: เข้าถึงได้ทุกอย่าง
- **Manager**: จัดการข้อมูลในแผนกตัวเอง
- **Supervisor**: อนุมัติและแก้ไข tasks
- **User**: สร้างและแก้ไข tasks ของตัวเอง

### Security Features
- Helmet สำหรับ security headers
- CORS configuration
- Rate limiting (100 requests/15 minutes)
- Input validation
- SQL injection protection via Supabase
- File upload restrictions

## 📁 File Upload

### Supported Formats
- Images: JPEG, PNG, GIF, WebP
- Max file size: 5MB (configurable)
- Max files per request: 5

### Storage
- Files stored locally in `uploads/` directory
- Unique filename generation with UUID
- File info tracked in database

### Security
- File type validation
- File size limits
- Path traversal protection
- User ownership verification

## 🧪 Testing

### Manual Testing
```bash
# Health check
curl http://localhost:3001/api/health

# Database test
curl http://localhost:3001/api/test-db

# Login test
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"employeeId": "admin"}'
```

### Testing with Sample Data
หลังจากรัน sample-data.sql แล้ว สามารถใช้ employee IDs เหล่านี้ในการทดสอบ:
- `admin` (Admin role)
- `251307` (Supervisor role) 
- `261401` (Manager role)
- `241303` (User role)

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Check environment variables
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY

# Test connection
curl http://localhost:3001/api/test-db
```

#### 2. Authentication Issues
- ตรวจสอบ JWT_SECRET ใน .env
- ตรวจสอบ token expiry
- ตรวจสอบ RLS policies ใน Supabase

#### 3. File Upload Issues
- ตรวจสอบ permissions ของ uploads/ directory
- ตรวจสอบ MAX_FILE_SIZE setting
- ตรวจสอบ file type restrictions

#### 4. CORS Issues
- ตรวจสอบ CORS_ORIGIN ใน .env
- ตรวจสอบ frontend URL

### Debug Mode
```bash
# Enable debug logging
NODE_ENV=development npm run dev
```

### Log Files
- Console logs สำหรับ development
- Error logs จะแสดงใน console
- Database query logs (enable ใน Supabase dashboard)

## 📊 Performance

### Optimization
- Database indexes สำหรับ frequent queries
- Connection pooling via Supabase
- Response compression
- Rate limiting
- Efficient pagination

### Monitoring
- Health check endpoint
- Database connection monitoring
- Error tracking via console logs

## 🔄 API Response Format

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "statusCode": 400
  },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### Pagination Response
```json
{
  "success": true,
  "data": {
    "projects": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 100,
      "itemsPerPage": 10
    }
  }
}
```

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Environment Variables for Production
- ตั้งค่า NODE_ENV=production
- ใช้ strong JWT_SECRET
- ตั้งค่า proper CORS_ORIGIN
- ตั้งค่า rate limiting ตามความต้องการ

## 🤝 Integration with Frontend

Frontend React app ควรตั้งค่า:
```javascript
// In frontend/.env
REACT_APP_API_URL=http://localhost:3001
```

API Service configuration:
```javascript
// frontend/src/services/apiService.js already configured
const apiService = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  timeout: 10000
});
```

## 📝 Development Guidelines

### Code Style
- ใช้ TypeScript strictly
- ตั้งค่า ESLint rules
- ใช้ consistent naming conventions
- Add proper error handling
- Document complex functions

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Add: new feature description"

# Push and create PR
git push origin feature/your-feature-name
```

## 📞 Support

หากพบปัญหาหรือต้องการความช่วยเหลือ:
1. ตรวจสอบ logs ใน console
2. ตรวจสอบ environment variables
3. ตรวจสอบ Supabase connection
4. ตรวจสอบ API endpoints ด้วย curl หรือ Postman

---

**สร้างเมื่อ**: 2025-01-05  
**Version**: 1.0.0  
**Maintainers**: Kaizen Development Team