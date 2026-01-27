# Hand-Me-Down - Complete Setup & Deployment Guide

## 🎯 Overview
This is a Next.js marketplace application that requires MongoDB for database, Cloudinary for image uploads, and JWT for authentication.

---

## 📋 Prerequisites

Before you begin, make sure you have:
- Node.js (v16 or higher) installed
- npm or yarn package manager
- Git installed

---

## 🔧 Step-by-Step Setup

### 1. Install Dependencies

```bash
cd ~/hand-me-down
npm install
```

This will install all the required packages listed in `package.json`.

---

### 2. Set Up MongoDB Database

You need a MongoDB database. You have two options:

#### Option A: MongoDB Atlas (Recommended - Free Cloud Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster (free tier is fine)
4. Click "Connect" on your cluster
5. Choose "Connect your application"
6. Copy the connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/...`)
7. Replace `<password>` with your actual database password
8. Replace `myFirstDatabase` with your desired database name (e.g., `handmedown`)

#### Option B: Local MongoDB

```bash
# Install MongoDB locally
brew install mongodb-community  # For Mac
# or follow instructions at https://www.mongodb.com/docs/manual/installation/

# Start MongoDB
brew services start mongodb-community

# Your connection string will be:
# mongodb://localhost:27017/handmedown
```

---

### 3. Set Up Cloudinary (Image Hosting)

Cloudinary is used for storing product images.

1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for a free account
3. After login, go to your Dashboard
4. You'll find your credentials:
   - **Cloud Name** (e.g., `dxxxxx`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz`)

---

### 4. Generate JWT Secret

For authentication security, you need a random secret key.

```bash
# Generate a random secret key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output - this is your JWT_SECRETS value.

---

### 5. Configure Environment Variables

Open the `.env.local` file in the project root and fill in your values:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/handmedown?retryWrites=true&w=majority

# Cloudinary Configuration
CDN_CLOUD_NAME=your-cloudinary-cloud-name
CDN_API_KEY=your-cloudinary-api-key
CDN_API_SECRET=your-cloudinary-api-secret

# JWT Configuration
JWT_SECRETS=your-generated-secret-key-from-step-4
```

**Important**: Never commit `.env.local` to Git! It's already in `.gitignore`.

---

### 6. Run the Development Server

```bash
npm run dev
```

The application will start at [http://localhost:3000](http://localhost:3000)

---

## 🚀 Deployment Options

### Option 1: Deploy to Vercel (Recommended - Easy & Free)

Vercel is made by the creators of Next.js and is the easiest deployment option.

#### Steps:

1. **Push your code to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with your GitHub account
   - Click "New Project"
   - Import your `hand-me-down` repository
   - Click "Deploy"

3. **Add Environment Variables in Vercel:**
   - In your Vercel project dashboard
   - Go to Settings → Environment Variables
   - Add each variable from your `.env.local`:
     - `MONGODB_URI`
     - `CDN_CLOUD_NAME`
     - `CDN_API_KEY`
     - `CDN_API_SECRET`
     - `JWT_SECRETS`
   - Click "Redeploy" after adding variables

4. **Done!** Your app will be live at `https://your-project.vercel.app`

---

### Option 2: Deploy to Netlify

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Login and deploy:
   ```bash
   netlify login
   netlify init
   netlify env:import .env.local
   netlify deploy --prod
   ```

---

### Option 3: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variables in the Variables tab
6. Deploy!

---

## 🧪 Testing Your Setup

### Check if everything is working:

1. **Database Connection**: Start the dev server - if it starts without errors, MongoDB is connected
2. **Image Upload**: Try adding a new product with an image
3. **Authentication**: Try registering a new user and logging in

### Common Issues:

**MongoDB Connection Error:**
- Check your IP is whitelisted in MongoDB Atlas (Network Access)
- Verify your username/password are correct
- Make sure connection string format is correct

**Cloudinary Upload Fails:**
- Verify your API credentials are correct
- Check you copied them correctly (no extra spaces)

**JWT Errors:**
- Make sure JWT_SECRETS is set and is a long random string

---

## 📁 Project Structure

```
hand-me-down/
├── components/       # React components
├── pages/           # Next.js pages and API routes
│   └── api/        # Backend API endpoints
├── lib/            # Utility functions
├── models/         # MongoDB schemas
├── controllers/    # Business logic
├── public/         # Static assets
└── styles/         # CSS files
```

---

## 🔒 Security Checklist

- [ ] `.env.local` is in `.gitignore`
- [ ] Environment variables are not committed to Git
- [ ] JWT_SECRETS is a strong random string
- [ ] MongoDB network access is configured properly
- [ ] Cloudinary API secrets are kept private

---

## 📝 Additional Scripts

```bash
# Development
npm run dev          # Start development server

# Production Build
npm run build        # Build for production
npm start           # Start production server

# Linting
npm run lint        # Check code quality
```

---

## 🆘 Need Help?

If you run into issues:
1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Make sure MongoDB is accessible
4. Check Cloudinary dashboard for upload errors

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Atlas Guide](https://www.mongodb.com/docs/atlas/)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [Vercel Deployment](https://vercel.com/docs)

---

Good luck with your deployment! 🎉
