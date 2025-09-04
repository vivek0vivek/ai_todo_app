'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Task } from '@/types';
import { TaskService } from '@/services/taskService';
import { useAuth } from '@/lib/auth';
import { 
  CheckCircle2, 
  Clock, 
  Star, 
  Calendar,
  ChevronDown,
  ChevronUp,
  AlarmClock,
  MoreHorizontal,
  Edit,
  Trash2,
  Tag,
  Folder
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface SwipeableTaskCardProps {
  task: Task;
  onTaskUpdated: (task: Task) => void;
  onTaskDeleted: (taskId: string) => void;
  onSwipeComplete?: () => void;
  onSwipeSnooze?: () => void;
}

export default function SwipeableTaskCard({ 
  task, 
  onTaskUpdated, 
  onTaskDeleted,
  onSwipeComplete,
  onSwipeSnooze
}: SwipeableTaskCardProps) {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    setIsDragging(true);
    startX.current = e.clientX;
    cardRef.current.style.transition = 'none';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newOffset = e.clientX - startX.current;
    setDragOffset(newOffset);
  };

  const handleMouseUp = () => {
    if (!isDragging || !cardRef.current) return;
    
    setIsDragging(false);
    cardRef.current.style.transition = 'transform 0.3s ease';
    
    const threshold = 100;
    if (dragOffset > threshold) {
      // Swipe right - complete task
      handleComplete();
    } else if (dragOffset < -threshold) {
      // Swipe left - snooze task
      handleSnooze();
    }
    
    setDragOffset(0);
  };

  const handleComplete = async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      const updatedTask = { ...task, completed: !task.completed };
      await TaskService.updateTask(user?.uid || '', task.id, updatedTask);
      onTaskUpdated(updatedTask);
      onSwipeComplete?.();
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSnooze = () => {
    // Add snooze logic here
    onSwipeSnooze?.();
    console.log('Task snoozed');
  };

  const handleDelete = async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      await TaskService.deleteTask(user?.uid || '', task.id);
      onTaskDeleted(task.id);
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high': return 'from-red-400 to-red-600';
      case 'medium': return 'from-yellow-400 to-orange-500';
      case 'low': return 'from-green-400 to-green-600';
      default: return 'from-blue-400 to-blue-600';
    }
  };

  const getSwipeHint = () => {
    if (dragOffset > 50) return 'Release to complete ✓';
    if (dragOffset < -50) return 'Release to snooze ⏰';
    return 'Swipe right to complete, left to snooze';
  };

  const progressPercentage = task.subNotes ? 
    (task.subNotes.filter(note => note.completed).length / task.subNotes.length) * 100 : 0;

  return (
    <div className="relative">
      {/* Swipe Action Backgrounds */}
      <div className="absolute inset-0 flex">
        <div className="flex-1 bg-green-500 flex items-center justify-start pl-6 rounded-2xl">
          <CheckCircle2 className="h-8 w-8 text-white" />
          <span className="text-white font-medium ml-2">Complete</span>
        </div>
        <div className="flex-1 bg-orange-500 flex items-center justify-end pr-6 rounded-2xl">
          <span className="text-white font-medium mr-2">Snooze</span>
          <AlarmClock className="h-8 w-8 text-white" />
        </div>
      </div>

      {/* Task Card */}
      <div
        ref={cardRef}
        className={cn(
          'relative bg-white rounded-2xl shadow-lg border-l-4 p-6 cursor-grab active:cursor-grabbing',
          'transition-all duration-200 hover:shadow-xl',
          task.completed && 'opacity-75',
          isLoading && 'pointer-events-none opacity-50'
        )}
        style={{
          transform: `translateX(${dragOffset}px)`,
          borderLeftColor: task.color || '#3B82F6'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Drag Hint */}
        {isDragging && (
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm">
            {getSwipeHint()}
          </div>
        )}

        {/* Card Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className={cn(
              'font-semibold text-lg mb-1',
              task.completed && 'line-through text-gray-500'
            )}>
              {task.title}
            </h3>
            
            {/* Tags and Category */}
            <div className="flex flex-wrap gap-2 mb-2">
              {task.category && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                  <Folder className="h-3 w-3 mr-1" />
                  {task.category}
                </span>
              )}
              {task.tags?.map((tag, index) => (
                <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Priority Indicator */}
            <div className={cn(
              'w-3 h-3 rounded-full bg-gradient-to-r',
              getPriorityColor()
            )} />
            
            {/* Quick Actions */}
            <div className="flex space-x-1">
              <button
                onClick={handleComplete}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  task.completed 
                    ? 'bg-green-100 text-green-600'
                    : 'hover:bg-green-50 text-gray-400 hover:text-green-600'
                )}
              >
                <CheckCircle2 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 hover:bg-gray-50 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {task.subNotes && task.subNotes.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Description */}
        {task.description && (
          <p className="text-gray-600 mb-3">{task.description}</p>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            {task.deadline && (
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(task.deadline).toLocaleDateString()}
              </div>
            )}
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {new Date(task.createdAt).toLocaleDateString()}
            </div>
          </div>
          
          <button
            onClick={handleDelete}
            className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            {/* Sub-notes */}
            {task.subNotes && task.subNotes.length > 0 && (
              <div className="space-y-2 mb-4">
                <h4 className="font-medium text-gray-900">Sub-tasks</h4>
                {task.subNotes.map((note, index) => (
                  <div key={note.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={note.completed}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      readOnly
                    />
                    <span className={cn(
                      'text-sm',
                      note.completed && 'line-through text-gray-500'
                    )}>
                      {note.type === 'numbered' && `${index + 1}. `}
                      {note.content}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex space-x-2">
              <button className="flex-1 bg-blue-50 text-blue-700 py-2 px-4 rounded-lg font-medium hover:bg-blue-100 transition-colors">
                <Edit className="h-4 w-4 inline mr-2" />
                Edit
              </button>
              <button 
                onClick={handleSnooze}
                className="flex-1 bg-orange-50 text-orange-700 py-2 px-4 rounded-lg font-medium hover:bg-orange-100 transition-colors"
              >
                <AlarmClock className="h-4 w-4 inline mr-2" />
                Snooze
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}