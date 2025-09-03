'use client';

import React, { useState, useEffect } from 'react';
import { Task } from '@/types';
import { TaskService } from '@/services/taskService';
import { aiService } from '@/services/aiService';
import TaskItem from './TaskItem';
import { Sparkles, Filter, ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

interface TaskListProps {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
}

type FilterType = 'all' | 'pending' | 'completed';
type SortType = 'created' | 'priority' | 'deadline' | 'ai-ranked';

export default function TaskList({ tasks, onTasksChange }: TaskListProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('created');
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks);
  const [isAiRanking, setIsAiRanking] = useState(false);

  useEffect(() => {
    applyFiltersAndSort();
  }, [tasks, filter, sort]);

  const applyFiltersAndSort = async () => {
    let filtered = [...tasks];

    // Apply filters
    switch (filter) {
      case 'pending':
        filtered = filtered.filter(t => !t.completed);
        break;
      case 'completed':
        filtered = filtered.filter(t => t.completed);
        break;
    }

    // Apply sorting
    if (sort === 'ai-ranked' && filtered.length > 0 && filtered.some(t => !t.completed)) {
      setIsAiRanking(true);
      try {
        const pendingTasks = filtered.filter(t => !t.completed);
        const completedTasks = filtered.filter(t => t.completed);
        const rankedPending = await aiService.rankTasks(pendingTasks);
        filtered = [...rankedPending, ...completedTasks];
      } catch (error) {
        console.error('AI ranking failed:', error);
      }
      setIsAiRanking(false);
    } else {
      switch (sort) {
        case 'priority':
          filtered.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          });
          break;
        case 'deadline':
          filtered.sort((a, b) => {
            if (!a.deadline && !b.deadline) return 0;
            if (!a.deadline) return 1;
            if (!b.deadline) return -1;
            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          });
          break;
        case 'created':
        default:
          filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          break;
      }
    }

    setFilteredTasks(filtered);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    const newTasks = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
    onTasksChange(newTasks);
  };

  const handleTaskDeleted = (taskId: string) => {
    const newTasks = tasks.filter(t => t.id !== taskId);
    onTasksChange(newTasks);
  };

  const getFilterCounts = () => {
    return {
      all: tasks.length,
      pending: tasks.filter(t => !t.completed).length,
      completed: tasks.filter(t => t.completed).length,
    };
  };

  const counts = getFilterCounts();

  return (
    <div className="space-y-4">
      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Filter Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(['all', 'pending', 'completed'] as FilterType[]).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize',
                filter === filterType
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              {filterType} ({counts[filterType]})
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortType)}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isAiRanking}
          >
            <option value="created">Sort by Created Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="deadline">Sort by Deadline</option>
            <option value="ai-ranked">AI Smart Ranking</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          {sort === 'ai-ranked' && (
            <Sparkles className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-500" />
          )}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {isAiRanking && (
          <div className="flex items-center justify-center py-8 text-gray-500">
            <Sparkles className="h-5 w-5 animate-pulse mr-2" />
            AI is ranking your tasks...
          </div>
        )}
        
        {!isAiRanking && filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              {filter === 'all' ? (
                <>
                  <Filter className="h-12 w-12 mx-auto mb-4" />
                  No tasks yet. Add your first task above!
                </>
              ) : filter === 'pending' ? (
                <>
                  <Filter className="h-12 w-12 mx-auto mb-4" />
                  No pending tasks. Great job! 🎉
                </>
              ) : (
                <>
                  <Filter className="h-12 w-12 mx-auto mb-4" />
                  No completed tasks yet.
                </>
              )}
            </div>
          </div>
        ) : (
          !isAiRanking && filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onTaskUpdated={handleTaskUpdated}
              onTaskDeleted={handleTaskDeleted}
            />
          ))
        )}
      </div>

      {sort === 'ai-ranked' && filteredTasks.length > 0 && !isAiRanking && (
        <div className="text-xs text-gray-500 text-center mt-4 flex items-center justify-center gap-1">
          <Sparkles className="h-3 w-3 text-purple-500" />
          Tasks ranked by AI based on priority, deadlines, and urgency
        </div>
      )}
    </div>
  );
}