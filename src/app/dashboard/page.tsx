'use client';

import React, { useState, useEffect, useCallback } from 'react';

// Force dynamic rendering for Firebase-dependent pages
export const dynamic = 'force-dynamic';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Task, TaskStats } from '@/types';
import { TaskService } from '@/services/taskService';
import Sidebar from '@/components/Sidebar';
import TaskInput from '@/components/TaskInput';
import TaskList from '@/components/TaskList';
import StatsWidget from '@/components/StatsWidget';
import AIInsightsBanner from '@/components/AIInsightsBanner';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
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

  const handleTasksChange = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome back, {user.displayName?.split(' ')[0] || 'there'}!
              </h1>
              <p className="text-gray-600">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            {/* Stats */}
            <StatsWidget stats={stats} />

            {/* AI Insights */}
            <AIInsightsBanner />

            {/* Task Input */}
            <TaskInput onTaskAdded={handleTaskAdded} />

            {/* Task List */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Tasks</h2>
              <TaskList 
                tasks={tasks} 
                onTasksChange={handleTasksChange} 
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}