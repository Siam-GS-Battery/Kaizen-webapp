# Kaizen Web Application

A modern full-stack web application built with React and Node.js Express.

## Project Structure

```
kaizen-webapp/
├── backend/                 # Node.js Express API
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Custom middleware
│   ├── models/             # Data models
│   ├── routes/             # API routes
│   ├── package.json        # Backend dependencies
│   ├── server.js           # Main server file
│   └── .env               # Environment variables
├── frontend/               # React application
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── hooks/         # Custom hooks
│   │   └── utils/         # Utility functions
│   ├── package.json       # Frontend dependencies
│   ├── tailwind.config.js # Tailwind CSS config
│   └── postcss.config.js  # PostCSS config
└── package.json           # Root package.json for scripts
```

## Tech Stack

### Frontend
- **React** - UI library
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware
- **Morgan** - HTTP request logger
- **Dotenv** - Environment variable management

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install all dependencies:
```bash
npm run install:all
```

2. Set up environment variables:
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
```

### Running the Application

#### Development Mode
```bash
# Run both frontend and backend concurrently
npm run dev

# Or run them separately:
npm run backend:dev    # Backend on http://localhost:5000
npm run frontend:dev   # Frontend on http://localhost:3000
```

#### Production Mode
```bash
npm run build
npm start
```

### Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build frontend for production
- `npm run test` - Run tests for both frontend and backend
- `npm run install:all` - Install dependencies for root, backend, and frontend

## API Endpoints

### Health Check
- `GET /api/health` - Check API status
- `GET /api` - Welcome message

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
```

### Frontend
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes
5. Submit a pull request

## License

This project is licensed under the MIT License.