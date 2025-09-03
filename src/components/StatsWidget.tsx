'use client';

import React from 'react';
import { TaskStats } from '@/types';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  Calendar,
  Target
} from 'lucide-react';

interface StatsWidgetProps {
  stats: TaskStats;
}

export default function StatsWidget({ stats }: StatsWidgetProps) {
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  
  const statItems = [
    {
      label: 'Total Tasks',
      value: stats.total,
      icon: Target,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      label: 'Overdue',
      value: stats.overdue,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      label: 'Today',
      value: stats.completedToday,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'This Week',
      value: stats.completedThisWeek,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="card mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Task Overview</h2>
        <div className="flex items-center">
          <div className="text-2xl font-bold text-blue-600">{completionRate}%</div>
          <div className="text-sm text-gray-500 ml-1">complete</div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statItems.map((item) => (
          <div key={item.label} className="text-center">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${item.bgColor} mb-2`}>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{item.value}</div>
            <div className="text-xs text-gray-500">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{stats.completed} of {stats.total} tasks</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>
    </div>
  );
}