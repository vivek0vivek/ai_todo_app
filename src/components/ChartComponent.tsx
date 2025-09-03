'use client';

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Task } from '@/types';

interface ChartComponentProps {
  tasks: Task[];
}

export default function ChartComponent({ tasks }: ChartComponentProps) {
  // Prepare data for completion trend (last 7 days)
  const getCompletionTrendData = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      const dateString = date.toDateString();
      const completedOnDay = tasks.filter(task => 
        task.completed && 
        new Date(task.updatedAt).toDateString() === dateString
      ).length;
      
      days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        completed: completedOnDay,
      });
    }
    
    return days;
  };

  // Prepare data for priority distribution
  const getPriorityData = () => {
    const priorities = { high: 0, medium: 0, low: 0 };
    
    tasks.forEach(task => {
      priorities[task.priority]++;
    });
    
    return [
      { name: 'High Priority', value: priorities.high, color: '#EF4444' },
      { name: 'Medium Priority', value: priorities.medium, color: '#F59E0B' },
      { name: 'Low Priority', value: priorities.low, color: '#10B981' },
    ].filter(item => item.value > 0);
  };

  // Prepare data for completion status
  const getCompletionData = () => {
    const completed = tasks.filter(task => task.completed).length;
    const pending = tasks.length - completed;
    
    return [
      { name: 'Completed', value: completed, color: '#10B981' },
      { name: 'Pending', value: pending, color: '#6B7280' },
    ].filter(item => item.value > 0);
  };

  // Prepare data for monthly overview (last 4 weeks)
  const getMonthlyData = () => {
    const weeks = [];
    const today = new Date();
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (today.getDay() + i * 7));
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      const completedInWeek = tasks.filter(task => {
        if (!task.completed) return false;
        const updatedDate = new Date(task.updatedAt);
        return updatedDate >= weekStart && updatedDate <= weekEnd;
      }).length;
      
      const createdInWeek = tasks.filter(task => {
        const createdDate = new Date(task.createdAt);
        return createdDate >= weekStart && createdDate <= weekEnd;
      }).length;
      
      weeks.push({
        week: `Week ${4 - i}`,
        completed: completedInWeek,
        created: createdInWeek,
      });
    }
    
    return weeks;
  };

  const completionTrendData = getCompletionTrendData();
  const priorityData = getPriorityData();
  const completionData = getCompletionData();
  const monthlyData = getMonthlyData();

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No data to display. Complete some tasks to see your analytics!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Completion Trend */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Completion Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={completionTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Priority and Completion Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Priorities</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Completion Status */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Completion Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={completionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {completionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Overview */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Overview</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="created" fill="#6B7280" name="Tasks Created" />
              <Bar dataKey="completed" fill="#10B981" name="Tasks Completed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}