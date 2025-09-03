# Deployment Guide

## Quick Start (Vercel - Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/ai-todo-app.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "New Project"
   - Import from GitHub repository
   - Vercel auto-detects Next.js configuration

3. **Set Environment Variables**
   In Vercel dashboard → Settings → Environment Variables, add:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_value
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_value
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_value
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_value
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_value
   NEXT_PUBLIC_FIREBASE_APP_ID=your_value
   GEMINI_API_KEY=your_value
   ```

4. **Deploy**
   - Click "Deploy"
   - Your app will be live at `https://your-app-name.vercel.app`

## Firebase Setup

### 1. Create Firebase Project
- Go to [Firebase Console](https://console.firebase.google.com/)
- Click "Create a project"
- Enter project name: `ai-todo-app`
- Disable Google Analytics (optional)
- Click "Create project"

### 2. Enable Authentication
- In Firebase console, go to "Authentication"
- Click "Get started"
- Go to "Sign-in method" tab
- Enable "Google" sign-in provider
- Set your project support email
- Add your domain (e.g., `your-app.vercel.app`) to authorized domains

### 3. Get Configuration
- Go to Project Settings (gear icon)
- Scroll to "Your apps" section
- Click "Add app" → Web app (</> icon)
- Register app with name "AI Todo Web"
- Copy the config object values to your environment variables

## Gemini API Setup

### 1. Get API Key
- Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
- Sign in with your Google account
- Click "Create API Key"
- Copy the key to `GEMINI_API_KEY` environment variable

### 2. Test API Key
- You can test the API key in the app's Settings page
- The app will show AI status as "Available" or "Unavailable"

## Alternative Deployment Platforms

### Netlify
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables in site settings
5. Deploy

### Railway
1. Connect GitHub repository
2. Add environment variables
3. Railway auto-detects and deploys Next.js apps
4. Get your live URL

### Self-Hosted (Ubuntu/CentOS)
1. Install Node.js 18+
2. Clone repository
3. Install dependencies: `npm install`
4. Build: `npm run build`
5. Start: `npm start`
6. Use PM2 for process management
7. Set up Nginx reverse proxy

## Environment Variables Checklist

Make sure all these are set in your deployment platform:

**Required for Authentication:**
- ✅ `NEXT_PUBLIC_FIREBASE_API_KEY`
- ✅ `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- ✅ `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- ✅ `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- ✅ `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- ✅ `NEXT_PUBLIC_FIREBASE_APP_ID`

**Required for AI Features:**
- ✅ `GEMINI_API_KEY`

**Note**: App will work without `GEMINI_API_KEY` but AI features will be disabled.

## Domain Configuration

### Custom Domain (Vercel)
1. In Vercel dashboard → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Add domain to Firebase authorized domains

### SSL/HTTPS
- Vercel provides automatic HTTPS
- For self-hosted: Use Let's Encrypt with Certbot

## Production Optimizations

### Performance
- Next.js automatically optimizes images and code splitting
- Enable compression in your reverse proxy
- Use CDN for static assets (Vercel handles this)

### Security
- Firebase handles authentication security
- API keys are properly configured for production
- No sensitive data exposed to client

### Monitoring
- Vercel provides analytics and performance metrics
- Monitor Gemini API usage in Google Cloud Console
- Set up error tracking (Sentry recommended)

## Troubleshooting Deployment

### Common Issues

**1. Build Fails**
```bash
# Check TypeScript errors
npm run type-check

# Check lint errors  
npm run lint
```

**2. Authentication Not Working**
- Verify all Firebase environment variables
- Check authorized domains in Firebase Console
- Ensure Google sign-in is enabled

**3. AI Features Not Working**
- Verify `GEMINI_API_KEY` is set
- Check API key permissions in Google Cloud
- App will fallback to basic functionality

**4. Hydration Errors**
- Usually related to date/time rendering
- Check browser console for specific errors
- Most resolve after client-side hydration

### Getting Help

1. Check Vercel/Netlify deployment logs
2. Use browser developer tools
3. Check Firebase Console for auth errors
4. Monitor Gemini API quotas

---

Your AI Todo App should now be successfully deployed and accessible to users worldwide! 🚀