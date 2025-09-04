'use client';

import React, { useState, useEffect, useCallback } from 'react';

// Force dynamic rendering for Firebase-dependent pages
export const dynamic = 'force-dynamic';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Task, TaskStats } from '@/types';
import { TaskService } from '@/services/taskService';
import Sidebar from '@/components/Sidebar';
import FolderSidebar from '@/components/FolderSidebar';
import TaskInput from '@/components/TaskInput';
import SwipeableTaskCard from '@/components/SwipeableTaskCard';
import StatsWidget from '@/components/StatsWidget';
import AIInsightsBanner from '@/components/AIInsightsBanner';
import AIInsightPanel from '@/components/AIInsightPanel';
import { Loader2, Sparkles, Brain, TrendingUp, Filter } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [selectedFolder, setSelectedFolder] = useState<string>('main');
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    completedToday: 0,
    completedThisWeek: 0,
  });

  const loadTasks = useCallback(async () => {
    if (user?.uid) {
      const loadedTasks = await TaskService.getTasks(user.uid);
      setTasks(loadedTasks);
    }
  }, [user?.uid]);

  const updateStats = useCallback(() => {
    const newStats = TaskService.getStats(tasks);
    setStats(newStats);
  }, [tasks]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user, loadTasks]);

  useEffect(() => {
    updateStats();
  }, [tasks, updateStats]);

  const handleTaskAdded = (task: Task) => {
    setTasks(prev => [task, ...prev]);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    const newTasks = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
    setTasks(newTasks);
  };

  const handleTaskDeleted = (taskId: string) => {
    const newTasks = tasks.filter(t => t.id !== taskId);
    setTasks(newTasks);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Main Sidebar */}
      <Sidebar />
      
      {/* Folder Sidebar */}
      <FolderSidebar
        folders={[]}
        selectedFolder={selectedFolder}
        onSelectFolder={setSelectedFolder}
        onCreateFolder={() => console.log('Create folder')}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-4xl mx-auto">
            {/* Animated Header with Greeting */}
            <div className="mb-8 text-center">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 animate-pulse">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Hello, {user.displayName?.split(' ')[0] || 'there'}! ✨
                </h1>
                <p className="text-gray-600 text-lg">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              
              {/* Progress Indicator */}
              <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
                <div className="flex items-center justify-center space-x-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
                    <div className="text-sm text-gray-500">Completed</div>
                  </div>
                  <div className="w-16 h-16 relative">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle cx="32" cy="32" r="28" stroke="#E5E7EB" strokeWidth="4" fill="none" />
                      <circle 
                        cx="32" 
                        cy="32" 
                        r="28" 
                        stroke="url(#gradient)" 
                        strokeWidth="4" 
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 28}`}
                        strokeDashoffset={`${2 * Math.PI * 28 * (1 - (stats.completed / Math.max(stats.total, 1)))}`}
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3B82F6" />
                          <stop offset="100%" stopColor="#8B5CF6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-700">
                        {Math.round((stats.completed / Math.max(stats.total, 1)) * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.pending}</div>
                    <div className="text-sm text-gray-500">Pending</div>
                  </div>
                </div>
              </div>
              
              {/* AI Insights Button */}
              <button 
                onClick={() => setShowAIInsights(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 hover:scale-105 shadow-lg"
              >
                <Brain className="h-5 w-5 mr-2" />
                Get AI Insights
              </button>
            </div>

            {/* Task Input */}
            <TaskInput onTaskAdded={handleTaskAdded} />

            {/* Filter Tabs */}
            <div className="flex justify-center mb-6">
              <div className="bg-white rounded-2xl p-1 shadow-lg">
                {(['pending', 'completed'] as const).map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType)}
                    className={cn(
                      'px-6 py-3 rounded-xl font-medium transition-all duration-200 capitalize',
                      filter === filterType
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    )}
                  >
                    {filterType === 'pending' ? `Active (${pendingTasks.length})` : `Done (${completedTasks.length})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Swipeable Task Cards */}
            <div className="space-y-4">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Filter className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    {filter === 'pending' ? 'All caught up!' : 'No completed tasks yet'}
                  </h3>
                  <p className="text-gray-500">
                    {filter === 'pending' 
                      ? 'Great job! You\'ve completed all your tasks. 🎉'
                      : 'Complete some tasks to see them here.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filter === 'pending' && filteredTasks.length > 0 && (
                    <div className="text-center mb-4">
                      <p className="text-sm text-gray-500 bg-white rounded-full px-4 py-2 inline-block shadow-sm">
                        💡 Swipe right to complete, left to snooze
                      </p>
                    </div>
                  )}
                  
                  {filteredTasks.map((task, index) => (
                    <div 
                      key={task.id} 
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <SwipeableTaskCard
                        task={task}
                        onTaskUpdated={handleTaskUpdated}
                        onTaskDeleted={handleTaskDeleted}
                        onSwipeComplete={() => {
                          console.log('Task completed with swipe!');
                        }}
                        onSwipeSnooze={() => {
                          console.log('Task snoozed!');
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Daily Achievement */}
            {stats.completedToday > 0 && (
              <div className="fixed bottom-6 right-6 bg-gradient-to-r from-green-400 to-blue-500 text-white p-4 rounded-2xl shadow-2xl animate-bounce">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-6 w-6" />
                  <div>
                    <div className="font-bold">Great Progress!</div>
                    <div className="text-sm opacity-90">{stats.completedToday} tasks completed today</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* AI Insights Panel */}
      <AIInsightPanel
        tasks={tasks}
        stats={stats}
        isVisible={showAIInsights}
        onClose={() => setShowAIInsights(false)}
      />
    </div>
  );
}