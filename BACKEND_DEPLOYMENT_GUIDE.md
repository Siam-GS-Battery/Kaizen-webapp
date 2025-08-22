# คู่มือการ Deploy Backend สำหรับ Kaizen Web Application

## สารบัญ
- [ข้อกำหนดเบื้องต้น](#ข้อกำหนดเบื้องต้น)
- [การเตรียม Backend สำหรับ Production](#การเตรียม-backend-สำหรับ-production)
- [Platform สำหรับ Deploy Backend](#platform-สำหรับ-deploy-backend)
  - [Railway](#1-railway-แนะนำ)
  - [Render](#2-render)
  - [Heroku](#3-heroku)
  - [AWS EC2](#4-aws-ec2)
- [การตั้งค่า Environment Variables](#การตั้งค่า-environment-variables)
- [การเชื่อมต่อ Frontend (Vercel) กับ Backend](#การเชื่อมต่อ-frontend-vercel-กับ-backend)
- [การ Monitor และ Logging](#การ-monitor-และ-logging)
- [Troubleshooting](#troubleshooting)

## ข้อกำหนดเบื้องต้น

### Backend Requirements
- Node.js version 18.x หรือสูงกว่า
- TypeScript
- Express.js
- Supabase account สำหรับ database

### Tools ที่ต้องติดตั้ง
```bash
# ตรวจสอบ Node.js version
node --version

# ตรวจสอบ npm version
npm --version

# ติดตั้ง TypeScript globally (optional)
npm install -g typescript
```

## การเตรียม Backend สำหรับ Production

### 1. Build TypeScript เป็น JavaScript
```bash
cd backend

# Install dependencies
npm install

# Build TypeScript to JavaScript
npm run build
```

### 2. ตรวจสอบไฟล์ที่จำเป็น
```
backend/
├── dist/           # โฟลเดอร์ที่เก็บไฟล์ JavaScript หลังจาก build
├── src/            # Source code TypeScript
├── package.json
├── tsconfig.json
└── .env.example    # ตัวอย่าง environment variables
```

### 3. สร้างไฟล์ .env.example
```env
# Server Configuration
PORT=5001
NODE_ENV=production

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=https://your-frontend.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Platform สำหรับ Deploy Backend

### 1. Railway (แนะนำ)

Railway เป็น platform ที่ใช้งานง่าย รองรับ Node.js และมี free tier

#### ขั้นตอนการ Deploy

1. **สมัครบัญชี Railway**
   - ไปที่ [railway.app](https://railway.app)
   - Sign up ด้วย GitHub

2. **สร้าง Project ใหม่**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli

   # Login
   railway login

   # Initialize project ในโฟลเดอร์ backend
   cd backend
   railway init
   ```

3. **Deploy จาก GitHub**
   - Connect GitHub repository
   - เลือก branch ที่ต้องการ deploy
   - Railway จะ auto-deploy เมื่อมี commit ใหม่

4. **ตั้งค่า Environment Variables**
   - ไปที่ Railway Dashboard > Variables
   - เพิ่ม environment variables ทั้งหมด

5. **ตั้งค่า Build Command**
   ```json
   {
     "build": "npm install && npm run build",
     "start": "npm run start:simple"
   }
   ```

6. **Generate Domain**
   - ไปที่ Settings > Domain
   - Generate domain หรือใช้ custom domain

### 2. Render

Render เป็น alternative ที่ดีสำหรับ free hosting

#### ขั้นตอนการ Deploy

1. **สมัครบัญชี Render**
   - ไปที่ [render.com](https://render.com)
   - Sign up ด้วย GitHub

2. **สร้าง Web Service**
   - Click "New +" > "Web Service"
   - Connect GitHub repository
   - เลือก branch

3. **Configuration**
   ```yaml
   Name: kaizen-backend
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm run start:simple
   Instance Type: Free
   ```

4. **Environment Variables**
   - ไปที่ Environment tab
   - เพิ่ม environment variables

5. **Auto-Deploy**
   - Enable auto-deploy from GitHub

### 3. Heroku

Heroku เป็น platform ที่มีความเสถียรสูง (ไม่มี free tier แล้ว)

#### ขั้นตอนการ Deploy

1. **Install Heroku CLI**
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku

   # Windows/Linux
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login และสร้าง App**
   ```bash
   heroku login
   cd backend
   heroku create kaizen-backend-app
   ```

3. **สร้าง Procfile**
   ```procfile
   web: npm run start:simple
   ```

4. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

5. **Set Environment Variables**
   ```bash
   heroku config:set PORT=5001
   heroku config:set NODE_ENV=production
   heroku config:set SUPABASE_URL=your_url
   # ตั้งค่าตัวแปรอื่นๆ
   ```

### 4. AWS EC2

สำหรับ production ขนาดใหญ่ที่ต้องการ control เต็มรูปแบบ

#### ขั้นตอนการ Deploy

1. **สร้าง EC2 Instance**
   - AMI: Ubuntu Server 22.04 LTS
   - Instance Type: t2.micro (free tier)
   - Security Group: เปิด port 22 (SSH), 80 (HTTP), 443 (HTTPS), 5001 (API)

2. **Connect ผ่าน SSH**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

3. **Install Dependencies**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js 18
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PM2
   sudo npm install -g pm2

   # Install nginx
   sudo apt install nginx -y
   ```

4. **Clone และ Setup Project**
   ```bash
   # Clone repository
   git clone https://github.com/your-repo/kaizen-webapp.git
   cd kaizen-webapp/backend

   # Install dependencies
   npm install

   # Build
   npm run build

   # Create .env file
   nano .env
   # Add your environment variables
   ```

5. **Setup PM2**
   ```bash
   # Start application with PM2
   pm2 start dist/server.js --name kaizen-backend

   # Save PM2 configuration
   pm2 save
   pm2 startup
   ```

6. **Configure Nginx**
   ```nginx
   # /etc/nginx/sites-available/kaizen-backend
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:5001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   ```bash
   # Enable site
   sudo ln -s /etc/nginx/sites-available/kaizen-backend /etc/nginx/sites-enabled
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## การตั้งค่า Environment Variables

### ตัวแปรที่สำคัญ

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Port ที่ server จะ run | `5001` |
| `NODE_ENV` | Environment mode | `production` |
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhbGc...` |
| `JWT_SECRET` | Secret key สำหรับ JWT | `your-secret-key` |
| `FRONTEND_URL` | URL ของ Frontend (Vercel) | `https://kaizen.vercel.app` |

### วิธีการสร้าง JWT_SECRET ที่ปลอดภัย
```bash
# Generate random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## การเชื่อมต่อ Frontend (Vercel) กับ Backend

### 1. ตั้งค่า Environment Variables ใน Vercel

1. ไปที่ Vercel Dashboard
2. เลือก Project > Settings > Environment Variables
3. เพิ่ม:
   ```
   REACT_APP_API_URL=https://your-backend-url.com
   REACT_APP_SUPABASE_URL=your-supabase-url
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key
   ```

### 2. Update Frontend Code

```javascript
// frontend/src/config/api.js
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // สำหรับ cookies/sessions
});
```

### 3. Configure CORS ใน Backend

```typescript
// backend/src/middleware/cors.ts
import cors from 'cors';

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

export default cors(corsOptions);
```

### 4. Handle Production vs Development

```javascript
// frontend/src/utils/config.js
const isDevelopment = process.env.NODE_ENV === 'development';

export const config = {
  API_URL: isDevelopment 
    ? 'http://localhost:5001/api' 
    : process.env.REACT_APP_API_URL,
  // other configs
};
```

## การ Monitor และ Logging

### 1. Health Check Endpoint

```typescript
// backend/src/routes/health.ts
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});
```

### 2. Logging with Winston

```bash
npm install winston
```

```typescript
// backend/src/utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;
```

### 3. Monitoring Services

- **UptimeRobot**: Free uptime monitoring
- **LogRocket**: Session replay และ error tracking
- **Sentry**: Error tracking และ performance monitoring
- **New Relic**: APM และ infrastructure monitoring

## Troubleshooting

### 1. CORS Issues

**Problem**: Frontend ไม่สามารถเชื่อมต่อ Backend
```
Access to XMLHttpRequest at 'https://api.example.com' from origin 'https://frontend.vercel.app' has been blocked by CORS policy
```

**Solution**:
- ตรวจสอบ CORS configuration ใน backend
- ตรวจสอบว่า FRONTEND_URL ใน environment variables ถูกต้อง
- ใช้ wildcard สำหรับ development: `origin: '*'` (ไม่แนะนำสำหรับ production)

### 2. Database Connection Issues

**Problem**: Cannot connect to Supabase
```
Error: Connection timeout to Supabase
```

**Solution**:
- ตรวจสอบ SUPABASE_URL และ keys
- ตรวจสอบ network/firewall settings
- ตรวจสอบ Supabase project status

### 3. Memory Issues

**Problem**: Server crashes with memory errors

**Solution**:
```javascript
// Increase Node.js memory limit
// package.json
{
  "scripts": {
    "start": "node --max-old-space-size=2048 dist/server.js"
  }
}
```

### 4. Port Already in Use

**Problem**: EADDRINUSE: address already in use

**Solution**:
```bash
# Find process using port
lsof -i :5001

# Kill process
kill -9 <PID>

# Or use npm script
npm run kill-port
```

### 5. Environment Variables Not Loading

**Problem**: undefined environment variables

**Solution**:
- ตรวจสอบว่ามี .env file ใน root directory
- ตรวจสอบว่า dotenv ถูก import ก่อน modules อื่น
- สำหรับ production ให้ set environment variables ผ่าน platform dashboard

## Security Best Practices

### 1. Environment Variables
- ไม่ commit .env file ลง git
- ใช้ .env.example เป็นตัวอย่าง
- Rotate keys และ secrets เป็นประจำ

### 2. Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use('/api', limiter);
```

### 3. Helmet for Security Headers
```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

### 4. Input Validation
```typescript
import Joi from 'joi';

const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const { error, value } = schema.validate(req.body);
```

## Deployment Checklist

- [ ] Build TypeScript to JavaScript
- [ ] Test locally with production build
- [ ] Set all environment variables
- [ ] Configure CORS for production
- [ ] Setup SSL/HTTPS
- [ ] Configure rate limiting
- [ ] Setup logging and monitoring
- [ ] Test API endpoints
- [ ] Verify database connections
- [ ] Check security headers
- [ ] Setup backup strategy
- [ ] Document API endpoints
- [ ] Setup CI/CD pipeline (optional)
- [ ] Load testing (optional)

## Scripts สำหรับ Deployment

### Auto-deploy script (deploy.sh)
```bash
#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo "🚀 Starting deployment process..."

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Run tests
echo "🧪 Running tests..."
npm test

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
else
    echo -e "${RED}❌ Tests failed! Aborting deployment.${NC}"
    exit 1
fi

# Start server
echo "🎯 Starting server..."
npm run start

echo -e "${GREEN}✅ Deployment complete!${NC}"
```

### Health check script (health-check.sh)
```bash
#!/bin/bash

API_URL="${1:-http://localhost:5001}"

response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health")

if [ "$response" = "200" ]; then
    echo "✅ API is healthy"
    exit 0
else
    echo "❌ API is not responding (HTTP $response)"
    exit 1
fi
```

## สรุป

การ Deploy Backend สำหรับใช้งานร่วมกับ Frontend บน Vercel มีหลายตัวเลือก:

1. **สำหรับ Development/Testing**: ใช้ Railway หรือ Render (free tier)
2. **สำหรับ Production ขนาดเล็ก-กลาง**: ใช้ Railway, Render, หรือ Heroku
3. **สำหรับ Production ขนาดใหญ่**: ใช้ AWS EC2, Google Cloud, หรือ Azure

สิ่งสำคัญคือต้อง:
- ตั้งค่า environment variables ให้ถูกต้อง
- Configure CORS ให้ทำงานกับ Vercel domain
- มี monitoring และ logging
- ทำ security hardening
- มี backup และ disaster recovery plan

หากมีปัญหาหรือต้องการความช่วยเหลือเพิ่มเติม สามารถติดต่อทีมพัฒนาหรือดู documentation เพิ่มเติมได้ที่ repository หลัก