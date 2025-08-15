# Vercel Deployment Guide

This guide will help you deploy the Library Management System to Vercel.

## Prerequisites

1. **GitHub Account**: You'll need a GitHub account to connect with Vercel
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) (free tier available)
3. **Git**: Make sure Git is installed on your system

## Step 1: Prepare Your Repository

1. **Initialize Git Repository** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Library Management System with Telemetry"
   ```

2. **Create GitHub Repository**:
   - Go to GitHub and create a new repository
   - Follow the instructions to push your local repository to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/library-management-system.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**:
   - Visit [vercel.com](https://vercel.com)
   - Sign in with your GitHub account

2. **Import Project**:
   - Click "New Project"
   - Select "Import Git Repository"
   - Choose your library-management-system repository

3. **Configure Project**:
   - **Project Name**: `library-management-system` (or your preferred name)
   - **Framework Preset**: Vercel should auto-detect "Create React App"
   - **Root Directory**: Leave empty (uses root)
   - **Build and Output Settings**:
     - Build Command: `cd frontend && npm run build`
     - Output Directory: `frontend/build`
     - Install Command: `cd frontend && npm install && cd ../backend && npm install`

4. **Environment Variables**:
   Add the following environment variables in the Vercel dashboard:
   ```
   NODE_ENV=production
   ```

5. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete (usually 2-3 minutes)

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Link to existing project? No
   - Project name: `library-management-system`
   - Directory: `./` (current directory)

## Step 3: Configure Production Environment

1. **Update Environment Variables**:
   In your Vercel dashboard, go to Settings > Environment Variables and add:
   ```
   NODE_ENV=production
   ```

2. **Domain Configuration**:
   - Your app will be available at `https://your-project-name.vercel.app`
   - You can also configure a custom domain in the Vercel dashboard

## Step 4: Verify Deployment

1. **Check Frontend**:
   - Visit your Vercel URL
   - Verify the React app loads correctly
   - Test navigation between pages

2. **Check Backend API**:
   - Visit `https://your-app.vercel.app/api/books`
   - Should return an empty array or your books data

3. **Check Telemetry**:
   - Navigate to different pages
   - Go to the Analytics page to see telemetry data

## Project Structure for Vercel

```
library-management-system/
├── api/
│   └── index.js                 # Vercel serverless function entry
├── backend/
│   ├── server.js               # Express server
│   ├── package.json
│   └── library.db              # SQLite database
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── build/                  # Built React app (generated)
├── vercel.json                 # Vercel configuration
└── package.json                # Root package.json
```

## Key Features of This Deployment

✅ **Serverless Backend**: API routes run as serverless functions
✅ **Static Frontend**: React app served as static files
✅ **Database**: SQLite database persists in serverless functions
✅ **Telemetry**: Full analytics and tracking system
✅ **Autocomplete**: Advanced search with fuzzy matching
✅ **Real-time Updates**: Dashboard updates automatically

## Troubleshooting

### Build Failures
- Check that all dependencies are listed in package.json files
- Verify the build commands in vercel.json are correct
- Check the Vercel build logs for specific error messages

### API Issues
- Ensure the api/index.js file correctly imports the backend server
- Check that serverless functions timeout isn't exceeded (10s default)
- Verify CORS is properly configured for your domain

### Database Issues
- SQLite works in Vercel's serverless environment
- Database is ephemeral - consider upgrading to a persistent database like PostgreSQL for production
- Each serverless function invocation creates a fresh database connection

### Performance Optimization
- React app is automatically optimized by Vercel
- API responses are cached appropriately
- Images and static assets are served via Vercel's CDN

## Next Steps

After successful deployment:

1. **Monitor Performance**: Use Vercel's analytics dashboard
2. **Custom Domain**: Configure a custom domain in Vercel settings
3. **Database Upgrade**: Consider migrating to PostgreSQL for persistence
4. **Monitoring**: Set up error tracking and performance monitoring
5. **CI/CD**: Automatic deployments on every git push to main branch

## Environment Variables Reference

```env
# Production (set in Vercel dashboard)
NODE_ENV=production

# Development (local .env files)
REACT_APP_API_URL=http://localhost:5000
GENERATE_SOURCEMAP=false
```

## Support

- **Vercel Docs**: https://vercel.com/docs
- **React Deployment**: https://create-react-app.dev/docs/deployment/
- **Node.js on Vercel**: https://vercel.com/docs/functions/serverless-functions/runtimes/node-js

Your Library Management System is now ready for production use with full telemetry and analytics! 🚀
