'use client';

import React, { useState } from 'react';
import { 
  Check, 
  Clock, 
  AlertCircle, 
  Edit2, 
  Trash2, 
  Save, 
  X,
  Calendar 
} from 'lucide-react';
import { Task } from '@/types';
import { TaskService } from '@/services/taskService';
import { cn } from '@/utils/cn';

interface TaskItemProps {
  task: Task;
  onTaskUpdated: (task: Task) => void;
  onTaskDeleted: (taskId: string) => void;
}

export default function TaskItem({ task, onTaskUpdated, onTaskDeleted }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && !task.completed;

  const handleToggleComplete = () => {
    const updatedTask = TaskService.updateTask(task.id, {
      completed: !task.completed,
    });
    if (updatedTask) {
      onTaskUpdated(updatedTask);
    }
  };

  const handleSaveEdit = () => {
    if (editTitle.trim() && editTitle !== task.title) {
      const updatedTask = TaskService.updateTask(task.id, {
        title: editTitle.trim(),
      });
      if (updatedTask) {
        onTaskUpdated(updatedTask);
      }
    }
    setIsEditing(false);
    setEditTitle(task.title);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(task.title);
  };

  const handleDelete = () => {
    if (TaskService.deleteTask(task.id)) {
      onTaskDeleted(task.id);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    if (date.toDateString() === now.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div
      className={cn(
        'bg-white rounded-lg border p-4 transition-all duration-200 hover:shadow-md',
        task.completed ? 'opacity-75 bg-gray-50' : '',
        isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={handleToggleComplete}
          className={cn(
            'flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors mt-0.5',
            task.completed
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'border-gray-300 hover:border-blue-400'
          )}
        >
          {task.completed && <Check className="h-3 w-3" />}
        </button>

        <div className="flex-1 min-w-0">
          {/* Title */}
          <div className="flex items-center gap-2 mb-2">
            {isEditing ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                  autoFocus
                />
                <button
                  onClick={handleSaveEdit}
                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                >
                  <Save className="h-4 w-4" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <h3
                  className={cn(
                    'text-sm font-medium flex-1',
                    task.completed
                      ? 'line-through text-gray-500'
                      : 'text-gray-900'
                  )}
                >
                  {task.title}
                </h3>
                
                {!task.completed && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={handleDelete}
                      className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {/* Priority */}
            <span
              className={cn(
                'px-2 py-1 rounded-full text-xs font-medium border',
                getPriorityColor(task.priority)
              )}
            >
              {task.priority}
            </span>

            {/* Deadline */}
            {task.deadline && (
              <div className="flex items-center gap-1">
                {isOverdue ? (
                  <AlertCircle className="h-3 w-3 text-red-500" />
                ) : (
                  <Calendar className="h-3 w-3" />
                )}
                <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                  {formatDate(task.deadline)}
                </span>
              </div>
            )}

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex gap-1">
                {task.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs"
                  >
                    #{tag}
                  </span>
                ))}
                {task.tags.length > 2 && (
                  <span className="text-gray-400">+{task.tags.length - 2}</span>
                )}
              </div>
            )}

            {/* Created date */}
            <div className="flex items-center gap-1 ml-auto">
              <Clock className="h-3 w-3" />
              <span>{task.createdAt.toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}