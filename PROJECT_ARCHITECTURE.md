# Kaizen Web Application - โครงสร้างและ Tech Stack

## ภาพรวมโปรเจกต์
Kaizen Web Application เป็นระบบจัดการข้อเสนอแนะและการปรับปรุงองค์กร ที่พัฒนาด้วย Full-stack architecture โดยใช้ React สำหรับ Frontend และ Node.js Express สำหรับ Backend

## โครงสร้างโปรเจกต์

```
Kaizen-webapp/
├── frontend/           # React Frontend Application
├── backend/           # Node.js Express Backend API
├── docs/              # เอกสารโปรเจกต์
├── web-bundles/       # Configuration bundles
├── package.json       # Root package.json สำหรับ monorepo
└── README.md          # คู่มือการใช้งาน
```

## Tech Stack

### Frontend
- **Framework**: React 18.2.0
- **Routing**: React Router DOM 6.15.0
- **Styling**: 
  - Tailwind CSS 3.3.3
  - Animate.css 4.1.1
- **UI Components**: 
  - SweetAlert2 11.22.2 (Notifications)
  - Chart.js 4.5.0 + React-ChartJS-2 5.3.0 (Data Visualization)
- **HTTP Client**: Axios 1.5.0
- **Build Tool**: Create React App (React Scripts 5.0.1)
- **Font**: IBM Plex Sans Thai (Thai language support)

### Backend
- **Runtime**: Node.js
- **Framework**: Express 4.18.2
- **Language**: TypeScript 5.2.2
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **File Upload**: Multer 1.4.5
- **Security**: 
  - Helmet 7.1.0
  - CORS 2.8.5
  - Express Rate Limit 7.1.5
  - Bcrypt.js 2.4.3
- **Validation**: Joi 17.11.0
- **Development**: 
  - ts-node-dev 2.0.0
  - ESLint + TypeScript ESLint
  - Jest 29.7.0 (Testing)

### Database & Storage
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage (รองรับ AWS Migration)
- **Migration**: Custom SQL migration scripts

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint with TypeScript support
- **Testing**: Jest
- **Build**: TypeScript Compiler
- **Development Server**: Concurrently (สำหรับรัน frontend + backend พร้อมกัน)

## โครงสร้าง Frontend

```
frontend/src/
├── components/        # Reusable UI Components
│   ├── Header.js
│   ├── Footer.js
│   ├── ImageUpload.js
│   └── SkeletonLoader.js
├── pages/            # Page Components
│   ├── Home.js
│   ├── Login.js
│   ├── Report.js
│   ├── GenbaForm.js
│   └── Tasklist.js
├── services/         # API Services
│   └── apiService.js
├── utils/            # Utility Functions
│   └── sessionManager.js
├── hooks/            # Custom React Hooks
├── config/           # Configuration Files
│   └── sessionConfig.js
└── data/             # Static Data
    ├── employeeData.js
    └── tasklistData.js
```

## โครงสร้าง Backend

```
backend/src/
├── config/           # Database Configuration
│   └── database.ts
├── middleware/       # Express Middleware
│   ├── auth.ts
│   ├── errorHandler.ts
│   └── notFoundHandler.ts
├── routes/           # API Routes
│   ├── auth.ts
│   ├── employee.ts
│   ├── reports.ts
│   ├── tasklist.ts
│   └── upload.ts
├── services/         # Business Logic
│   └── storageService.ts
├── types/            # TypeScript Type Definitions
│   └── index.ts
├── utils/            # Utility Functions
│   ├── imageHandler.ts
│   └── response.ts
└── server.ts         # Main Server File
```

## Features หลัก

1. **การจัดการผู้ใช้งาน (User Management)**
   - ระบบล็อกอิน/ล็อกเอาต์
   - การจัดการสิทธิ์ผู้ใช้
   - ระบบ JWT Authentication

2. **การจัดการรายงาน (Report Management)**
   - สร้างรายงาน Kaizen
   - แสดงผลรายงานแบบ Dashboard
   - การอัปโหลดไฟล์รูปภาพ

3. **ระบบ Tasklist**
   - การจัดการงาน
   - การติดตามสถานะงาน
   - ระบบ Best Kaizen

4. **การจัดการข้อมูลพนักงาน**
   - CRUD operations
   - การแบ่งตามแผนก
   - การจัดการตำแหน่งงาน

## การรันโปรเจกต์

### Development Mode
```bash
# Install dependencies
npm run install:all

# Run both frontend and backend
npm run dev

# Run frontend only
npm run frontend:dev

# Run backend only  
npm run backend:dev
```

### Production Mode
```bash
# Build frontend
npm run build

# Start production server
npm start
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=your_supabase_database_url
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret
PORT=5001
```

### Frontend
- Proxy ตั้งค่าที่ `http://localhost:5001`

## Database Schema
- ดูรายละเอียดได้ที่ `backend/database/schema.sql`
- ER Diagram: `docs/ER-Diagram.md`
- Data Dictionary: `docs/Data-Dictionary.md`

## Security Features
- Helmet.js สำหรับ HTTP headers security
- CORS configuration
- Rate limiting
- JWT authentication
- Input validation ด้วย Joi
- Password hashing ด้วย bcrypt

## Performance Optimizations
- Code splitting (React Router)
- Image optimization
- Skeleton loading components
- Caching strategies
- Database indexing

## Deployment
- รองรับการ deploy บน AWS
- Supabase integration
- Docker support (ถ้ามี)

## การพัฒนาเพิ่มเติม
- ระบบ notification realtime
- Mobile responsive design
- Progressive Web App (PWA)
- Multi-language support (Thai/English)

---
*เอกสารนี้สร้างขึ้นโดย Claude Code*