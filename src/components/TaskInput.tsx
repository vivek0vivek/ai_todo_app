'use client';

import React, { useState } from 'react';
import { Plus, Sparkles, Loader2 } from 'lucide-react';
import { aiService } from '@/services/aiService';
import { TaskService } from '@/services/taskService';
import { Task } from '@/types';
import { cn } from '@/utils/cn';

interface TaskInputProps {
  onTaskAdded: (task: Task) => void;
}

export default function TaskInput({ onTaskAdded }: TaskInputProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAiEnabled, setIsAiEnabled] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    
    try {
      let taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
        title: input.trim(),
        description: '',
        completed: false,
        priority: 'medium' as const,
        tags: [],
      };

      // Try AI parsing if enabled
      if (isAiEnabled) {
        try {
          const parsedTask = await aiService.parseTask(input.trim());
          if (parsedTask) {
            taskData = {
              ...taskData,
              title: parsedTask.title,
              priority: parsedTask.priority,
              tags: parsedTask.tags,
            };
            
            if (parsedTask.deadline) {
              taskData = { ...taskData, deadline: parsedTask.deadline };
            }
          }
        } catch (error) {
          console.warn('AI parsing failed, using fallback:', error);
        }
      }

      const newTask = TaskService.addTask(taskData);
      onTaskAdded(newTask);
      setInput('');
    } catch (error) {
      console.error('Error adding task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Add New Task</h2>
          <button
            type="button"
            onClick={() => setIsAiEnabled(!isAiEnabled)}
            className={cn(
              'flex items-center px-3 py-1 text-xs rounded-full transition-colors',
              isAiEnabled
                ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            <Sparkles className="h-3 w-3 mr-1" />
            AI {isAiEnabled ? 'On' : 'Off'}
          </button>
        </div>
        
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isAiEnabled
                ? 'e.g., "Buy groceries tomorrow" or "URGENT: Fix login bug"'
                : 'Enter task title...'
            }
            className="input-primary pr-12"
            disabled={isLoading}
          />
          
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </button>
        </div>
        
        {isAiEnabled && (
          <p className="text-xs text-gray-500">
            💡 AI will automatically parse deadlines, priorities, and tags from your input
          </p>
        )}
      </form>
    </div>
  );
}