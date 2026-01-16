# Learning Management System

Full-stack LMS application with React frontend and Express backend.

## Quick Start

### 1. Install Dependencies

```bash
# Install all dependencies (root, backend, frontend)
npm run install:all
```

### 2. Configure Environment Variables

**Backend** (`Backend/.env`):
```env
PORT=8000
MONGODB_URI=mongodb+srv://username:password@cluster0.7ehi5pj.mongodb.net
CORS_ORIGIN=http://localhost:5173

ACCESS_TOKEN_SECRET=your_secret_key_here
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_secret_here
REFRESH_TOKEN_EXPIRY=13d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

ADMIN_ID=your_admin_database_id
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:8000/api/v1
```

### 3. Run Development Servers

```bash
# Start both backend and frontend
npm run dev

# Or start individually:
npm run dev:backend   # Backend only (http://localhost:8000)
npm run dev:frontend  # Frontend only (http://localhost:5173)
```

## Application URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api/v1

## Project Structure

```
├── Backend/
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   ├── middlewares/     # Auth, upload, etc.
│   │   └── utils/           # Helper functions
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── context/         # Auth & Toast providers
│   │   ├── services/        # API client
│   │   └── utils/           # Helpers
│   └── package.json
│
└── package.json             # Root scripts
```

## Available Scripts

```bash
npm run dev              # Run both servers concurrently
npm run dev:backend      # Backend dev server
npm run dev:frontend     # Frontend dev server  
npm run install:all      # Install all dependencies
```

## Features

- 🎓 Multi-role support (Admin, Instructor, Learner)
- 📚 Course management and enrollment
- 🎥 Video content delivery
- 📊 Progress tracking
- 💳 Bank integration for payments
- 🔐 JWT authentication
- ☁️ Cloudinary media storage

## Tech Stack

**Frontend:**
- React 19
- React Router
- Axios
- Tailwind CSS
- Vite

**Backend:**
- Node.js
- Express
- MongoDB + Mongoose
- JWT
- Cloudinary
- Multer

## Troubleshooting

### Permission Errors

If you encounter `EACCES` errors with npm binaries:

```bash
cd frontend
chmod +x node_modules/.bin/*
chmod +x node_modules/@esbuild/linux-x64/bin/esbuild
```

### MongoDB Connection Issues

Ensure your MongoDB connection string is correct and your IP is whitelisted in MongoDB Atlas.

### CORS Errors

Make sure `CORS_ORIGIN` in backend `.env` matches your frontend URL (http://localhost:5173).
