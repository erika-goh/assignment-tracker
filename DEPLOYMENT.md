# Deployment Guide for Assignment Tracker

This guide will help you deploy your Assignment Tracker to Vercel with persistent data storage.

## Prerequisites

1. A GitHub account
2. A Vercel account (free tier is sufficient)
3. Your project pushed to a GitHub repository

## Step 1: Deploy to Vercel

1. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "New Project"
   - Import your assignment-tracker repository

2. **Configure Build Settings:**
   - Framework Preset: `Create React App`
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

3. **Deploy:**
   - Click "Deploy"
   - Wait for the deployment to complete

## Step 2: Set Up Vercel Postgres Database

1. **Add Postgres Database:**
   - In your Vercel dashboard, go to your project
   - Click on the "Storage" tab
   - Click "Create Database"
   - Select "Postgres"
   - Choose a name for your database (e.g., "assignment-tracker-db")
   - Click "Create"

2. **Environment Variables:**
   - Vercel will automatically add the Postgres environment variables
   - Go to your project settings → Environment Variables
   - Verify that these variables are present:
     - `POSTGRES_URL`
     - `POSTGRES_PRISMA_URL`
     - `POSTGRES_URL_NON_POOLING`
     - `POSTGRES_USER`
     - `POSTGRES_HOST`
     - `POSTGRES_PASSWORD`
     - `POSTGRES_DATABASE`

## Step 3: Update API Configuration

1. **Update API Base URL:**
   - In your local project, edit `src/services/api.ts`
   - Replace `'https://your-app-name.vercel.app/api'` with your actual Vercel app URL
   - Example: `'https://assignment-tracker-abc123.vercel.app/api'`

2. **Commit and Push:**
   ```bash
   git add .
   git commit -m "Update API configuration for production"
   git push origin main
   ```

3. **Redeploy:**
   - Vercel will automatically redeploy when you push to your main branch

## Step 4: Test Your Deployment

1. **Visit Your App:**
   - Go to your Vercel app URL
   - Try creating a new assignment
   - Add work date ranges using the calendar
   - Mark assignments as complete

2. **Verify Data Persistence:**
   - Refresh the page
   - Your assignments and work date ranges should still be there
   - Data is now stored in the Vercel Postgres database

## Step 5: Custom Domain (Optional)

1. **Add Custom Domain:**
   - In your Vercel dashboard, go to your project
   - Click on the "Domains" tab
   - Add your custom domain
   - Follow the DNS configuration instructions

## Local Development with Database

If you want to test the database functionality locally:

1. **Install PostgreSQL locally** or use a cloud service
2. **Create a `.env.local` file** with your database connection string:
   ```
   POSTGRES_URL=postgresql://username:password@localhost:5432/assignment_tracker
   ```
3. **Run the development server:**
   ```bash
   npm start
   ```

## Troubleshooting

### Common Issues:

1. **Database Connection Errors:**
   - Verify environment variables are set correctly
   - Check that the database is created and accessible
   - Ensure the connection string is valid

2. **API Endpoints Not Working:**
   - Check the Vercel function logs in the dashboard
   - Verify the API routes are deployed correctly
   - Test endpoints using the Vercel CLI: `vercel dev`

3. **Build Errors:**
   - Check the build logs in Vercel dashboard
   - Ensure all dependencies are in `package.json`
   - Verify TypeScript compilation

### Getting Help:

- Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
- Vercel Postgres docs: [vercel.com/docs/storage/vercel-postgres](https://vercel.com/docs/storage/vercel-postgres)
- Vercel community: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

## Features After Deployment

Once deployed, your Assignment Tracker will have:

✅ **Persistent Data Storage** - All assignments and work date ranges saved to database
✅ **Real-time Sync** - Changes sync across devices and sessions
✅ **Scalable Backend** - Serverless functions handle all API requests
✅ **Global CDN** - Fast loading times worldwide
✅ **Automatic Deployments** - Updates when you push to GitHub
✅ **Free Hosting** - Vercel's generous free tier

Your assignment tracking data will now persist across sessions, devices, and browser refreshes!
