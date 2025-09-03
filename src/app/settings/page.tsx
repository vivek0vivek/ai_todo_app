'use client';

import React, { useState, useEffect } from 'react';

// Force dynamic rendering for Firebase-dependent pages
export const dynamic = 'force-dynamic';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { aiService } from '@/services/aiService';
import Sidebar from '@/components/Sidebar';
import { 
  Loader2, 
  Settings as SettingsIcon, 
  Sparkles, 
  User, 
  Database,
  Info,
  CheckCircle,
  XCircle,
  Trash2
} from 'lucide-react';
import { TaskService } from '@/services/taskService';

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null);
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      checkAiAvailability();
    }
  }, [user]);

  const checkAiAvailability = async () => {
    setIsTestingAi(true);
    try {
      const available = await aiService.isAvailable();
      setAiAvailable(available);
    } catch (error) {
      setAiAvailable(false);
    } finally {
      setIsTestingAi(false);
    }
  };

  const handleClearAllData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ai-todo-tasks');
      localStorage.removeItem('ai-todo-insights');
      setShowClearConfirm(false);
      alert('All data has been cleared successfully!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
              <p className="text-gray-600">Manage your account and application preferences</p>
            </div>

            <div className="space-y-6">
              {/* Account Information */}
              <div className="card">
                <div className="flex items-center mb-4">
                  <User className="h-5 w-5 text-gray-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    {user.photoURL && (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="h-16 w-16 rounded-full mr-4"
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {user.displayName || 'User'}
                      </h3>
                      <p className="text-gray-600">{user.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={user.displayName || ''}
                        disabled
                        className="input-primary bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="input-primary bg-gray-50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Features */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Sparkles className="h-5 w-5 text-purple-600 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-900">AI Features</h2>
                  </div>
                  <button
                    onClick={checkAiAvailability}
                    disabled={isTestingAi}
                    className="btn-secondary text-sm"
                  >
                    {isTestingAi ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        Testing...
                      </>
                    ) : (
                      'Test Connection'
                    )}
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">AI Service Status</h3>
                      <p className="text-sm text-gray-600">
                        Natural language parsing and smart rankings
                      </p>
                    </div>
                    <div className="flex items-center">
                      {aiAvailable === null ? (
                        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                      ) : aiAvailable ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-5 w-5 mr-1" />
                          <span className="text-sm font-medium">Available</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600">
                          <XCircle className="h-5 w-5 mr-1" />
                          <span className="text-sm font-medium">Unavailable</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {!aiAvailable && aiAvailable !== null && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex">
                        <Info className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-medium text-yellow-800 mb-1">
                            AI Features Disabled
                          </h3>
                          <p className="text-sm text-yellow-700">
                            The app will continue to work normally with basic task management. 
                            AI features like smart parsing and ranking are temporarily unavailable.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-gray-600">
                    <h4 className="font-medium mb-2">Available AI Features:</h4>
                    <ul className="space-y-1 ml-4">
                      <li>• Natural language task parsing</li>
                      <li>• Automatic priority detection</li>
                      <li>• Deadline extraction from text</li>
                      <li>• Smart task ranking</li>
                      <li>• Daily productivity insights</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Data Management */}
              <div className="card">
                <div className="flex items-center mb-4">
                  <Database className="h-5 w-5 text-gray-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Data Management</h2>
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex">
                      <Info className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-blue-800 mb-1">
                          Data Storage
                        </h3>
                        <p className="text-sm text-blue-700">
                          Your tasks and settings are stored locally in your browser. 
                          Data is not synced across devices or backed up to the cloud.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Clear All Data</h3>
                        <p className="text-sm text-gray-600">
                          This will permanently delete all your tasks and settings
                        </p>
                      </div>
                      <button
                        onClick={() => setShowClearConfirm(true)}
                        className="btn-secondary text-red-600 hover:bg-red-50 flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Clear Data
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* App Information */}
              <div className="card">
                <div className="flex items-center mb-4">
                  <SettingsIcon className="h-5 w-5 text-gray-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Application Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Version</h3>
                    <p className="text-gray-600">1.0.0</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Built with</h3>
                    <p className="text-gray-600">Next.js, React, Tailwind CSS</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">AI Powered by</h3>
                    <p className="text-gray-600">Google Gemini</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Authentication</h3>
                    <p className="text-gray-600">Firebase Auth</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Clear Data Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirm Data Deletion
            </h3>
            <p className="text-gray-600 mb-6">
              This action cannot be undone. All your tasks and settings will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleClearAllData}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete All Data
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}