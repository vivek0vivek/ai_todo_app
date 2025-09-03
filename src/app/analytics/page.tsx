'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Task } from '@/types';
import { TaskService } from '@/services/taskService';
import Sidebar from '@/components/Sidebar';
import ChartComponent from '@/components/ChartComponent';
import { Loader2, TrendingUp, Calendar, Target, Award } from 'lucide-react';

export default function AnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const loadTasks = async () => {
      if (user?.uid) {
        const loadedTasks = await TaskService.getTasks(user.uid);
        setTasks(loadedTasks);
      }
    };

    if (user) {
      loadTasks();
    }
  }, [user]);

  const getAnalyticsData = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const completedToday = tasks.filter(task => 
      task.completed && new Date(task.updatedAt) >= today
    ).length;

    const completedThisWeek = tasks.filter(task => 
      task.completed && new Date(task.updatedAt) >= thisWeek
    ).length;

    const completedThisMonth = tasks.filter(task => 
      task.completed && new Date(task.updatedAt) >= thisMonth
    ).length;

    const averageCompletionTime = tasks
      .filter(task => task.completed)
      .reduce((acc, task) => {
        const timeDiff = new Date(task.updatedAt).getTime() - new Date(task.createdAt).getTime();
        return acc + timeDiff;
      }, 0) / Math.max(1, tasks.filter(task => task.completed).length);

    const averageDays = Math.round(averageCompletionTime / (1000 * 60 * 60 * 24));

    const streak = calculateStreak();

    return {
      completedToday,
      completedThisWeek,
      completedThisMonth,
      averageDays: isNaN(averageDays) ? 0 : averageDays,
      streak,
    };
  };

  const calculateStreak = () => {
    const sortedTasks = tasks
      .filter(task => task.completed)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    if (sortedTasks.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    while (streak < 30) { // Max 30 days to prevent infinite loop
      const tasksOnDate = sortedTasks.filter(task => {
        const taskDate = new Date(task.updatedAt);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === currentDate.getTime();
      });

      if (tasksOnDate.length === 0) {
        break;
      }

      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const analyticsData = getAnalyticsData();

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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics</h1>
              <p className="text-gray-600">Track your productivity and task completion patterns</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="card text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-50 mb-4">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {analyticsData.completedToday}
                </div>
                <div className="text-sm text-gray-500">Completed Today</div>
              </div>

              <div className="card text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-green-50 mb-4">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {analyticsData.completedThisWeek}
                </div>
                <div className="text-sm text-gray-500">This Week</div>
              </div>

              <div className="card text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-purple-50 mb-4">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {analyticsData.completedThisMonth}
                </div>
                <div className="text-sm text-gray-500">This Month</div>
              </div>

              <div className="card text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-yellow-50 mb-4">
                  <Award className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {analyticsData.streak}
                </div>
                <div className="text-sm text-gray-500">Day Streak</div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Completion Rate</h3>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {tasks.length > 0 
                    ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)
                    : 0
                  }%
                </div>
                <p className="text-sm text-gray-500">Of all tasks completed</p>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Average Time</h3>
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {analyticsData.averageDays} {analyticsData.averageDays === 1 ? 'day' : 'days'}
                </div>
                <p className="text-sm text-gray-500">To complete a task</p>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Most Productive</h3>
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {(() => {
                    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    const dayCount = new Array(7).fill(0);
                    
                    tasks.filter(task => task.completed).forEach(task => {
                      const day = new Date(task.updatedAt).getDay();
                      dayCount[day]++;
                    });
                    
                    const maxIndex = dayCount.indexOf(Math.max(...dayCount));
                    return Math.max(...dayCount) > 0 ? days[maxIndex] : 'N/A';
                  })()}
                </div>
                <p className="text-sm text-gray-500">Day of the week</p>
              </div>
            </div>

            {/* Charts */}
            <ChartComponent tasks={tasks} />
          </div>
        </main>
      </div>
    </div>
  );
}