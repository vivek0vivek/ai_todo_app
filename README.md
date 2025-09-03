# AI Todo App

A modern, AI-powered task management application built with Next.js and React. Features intelligent task parsing, priority ranking, and productivity insights powered by Google Gemini AI.

## 🌟 Features

- **AI-Powered Task Parsing**: Natural language input with automatic deadline and priority detection
- **Smart Task Ranking**: AI-driven task prioritization based on urgency and importance
- **Google Authentication**: Secure login with Google Sign-In
- **Analytics Dashboard**: Comprehensive productivity tracking with charts and insights
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Offline Capability**: Local storage fallback when AI services are unavailable
- **Daily Insights**: AI-generated productivity summaries and suggestions

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth with Google Sign-In
- **AI**: Google Gemini API
- **Charts**: Recharts
- **Icons**: Lucide React
- **Storage**: localStorage (with optional cloud storage support)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-todo-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure environment variables** in `.env.local`:
   
   **Firebase Configuration:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use existing one
   - Enable Authentication and add Google as a sign-in provider
   - Get your config from Project Settings > General > Your apps > Web app
   
   **Gemini API Key:**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add it to your environment variables

   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

   # AI Configuration
   GEMINI_API_KEY=your_gemini_api_key
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm start          # Start production server
npm run lint       # Run ESLint
npm run type-check # Run TypeScript type checking
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com/)
   - Import your repository
   - Vercel will automatically detect it's a Next.js app

3. **Set environment variables**
   - In your Vercel project dashboard, go to Settings > Environment Variables
   - Add all the environment variables from your `.env.local`

4. **Deploy**
   - Your app will automatically deploy on every push to main branch
   - You'll get a live URL like `https://your-app.vercel.app`

### Alternative Deployment Options

- **Netlify**: Follow similar process as Vercel
- **Railway**: Connect GitHub repo and set environment variables
- **Self-hosted**: Use `npm run build` then serve the `.next` folder

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── dashboard/         # Dashboard page
│   ├── analytics/         # Analytics page  
│   ├── settings/          # Settings page
│   ├── login/             # Login page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page (redirects)
│   └── globals.css        # Global styles
├── components/            # Reusable React components
│   ├── AIInsightsBanner.tsx
│   ├── ChartComponent.tsx
│   ├── Sidebar.tsx
│   ├── StatsWidget.tsx
│   ├── TaskInput.tsx
│   ├── TaskItem.tsx
│   └── TaskList.tsx
├── lib/                   # Library configurations
│   ├── auth.tsx          # Authentication context
│   └── firebase.ts       # Firebase setup
├── services/              # Business logic & API calls
│   ├── aiService.ts      # Gemini AI integration
│   └── taskService.ts    # Task CRUD operations
├── types/                 # TypeScript type definitions
│   └── index.ts
└── utils/                 # Utility functions
    └── cn.ts             # Class name utilities
```

## 🎯 Usage Guide

### Adding Tasks
- **Basic**: Type "Buy groceries" 
- **With AI**: Type "Buy groceries tomorrow high priority" → AI extracts deadline and priority
- **Natural Language**: "URGENT: Fix the login bug by Friday"

### AI Features
- **Task Parsing**: Automatically extracts deadlines, priorities, and tags
- **Smart Ranking**: Click "AI Smart Ranking" to get optimized task order
- **Daily Insights**: View AI-generated productivity summaries
- **Fallback Mode**: App works normally if AI is unavailable

### Analytics
- Track completion trends over time
- View productivity patterns by day/week
- Monitor task priorities and completion rates
- See streak counters and performance metrics

## 🔒 Privacy & Security

- **Local Storage**: Tasks stored in browser localStorage by default
- **Secure Authentication**: Google OAuth via Firebase
- **No Data Collection**: App doesn't collect or store personal data on servers
- **AI Processing**: Task content sent to Gemini API only for parsing (not stored)

## 🐛 Troubleshooting

### Common Issues

1. **AI Features Not Working**
   - Check if `GEMINI_API_KEY` is set correctly
   - Verify API key has proper permissions
   - App will fall back to basic functionality

2. **Authentication Issues**
   - Ensure all Firebase environment variables are set
   - Check if Google sign-in is enabled in Firebase Console
   - Verify domain is added to authorized domains

3. **Build Errors**
   - Run `npm run type-check` to identify TypeScript issues
   - Ensure all environment variables are set for production

4. **Charts Not Displaying**
   - This is usually a hydration issue in production
   - Recharts should work fine once client-side rendering takes over

## 🔮 Future Enhancements

- [ ] Cloud sync with Firebase/Supabase
- [ ] Team collaboration features
- [ ] Mobile app (React Native)
- [ ] Advanced AI features (voice input, smart scheduling)
- [ ] Integration with calendar apps
- [ ] Task templates and recurring tasks
- [ ] Dark mode support
- [ ] Offline PWA functionality

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For issues and questions:
1. Check the troubleshooting section above
2. Open an issue on GitHub
3. Review the documentation

---

**Built with ❤️ using Next.js and AI**