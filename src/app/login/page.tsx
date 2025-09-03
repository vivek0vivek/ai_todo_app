'use client';

import React, { useState, useEffect } from 'react';

// Force dynamic rendering for Firebase-dependent pages
export const dynamic = 'force-dynamic';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { CheckCircle2, LogIn, Loader2, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signInWithGoogle, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
      setError('Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <div className="flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-gray-600">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle2 className="h-12 w-12 text-blue-600" />
              <Sparkles className="h-6 w-6 text-purple-500 ml-2" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Todo</h1>
            <p className="text-gray-600">Smart task management powered by AI</p>
          </div>

          {/* Features */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Features</h2>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                Natural language task parsing
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                AI-powered priority ranking
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                Daily productivity insights
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                Smart deadline detection
              </li>
            </ul>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-white border border-gray-300 rounded-lg px-6 py-3 flex items-center justify-center text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our terms of service and privacy policy
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Built with AI • Secure • Fast
          </p>
        </div>
      </div>
    </div>
  );
}