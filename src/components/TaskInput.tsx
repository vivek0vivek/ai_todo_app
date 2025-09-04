'use client';

import React, { useState } from 'react';
import { Plus, Sparkles, Loader2, Hash, List, CheckSquare, Type, Palette, FolderOpen, Paperclip, X, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { aiService } from '@/services/aiService';
import { TaskService } from '@/services/taskService';
import { Task, SubNote, Folder } from '@/types';
import { cn } from '@/utils/cn';

interface TaskInputProps {
  onTaskAdded: (task: Task) => void;
}

export default function TaskInput({ onTaskAdded }: TaskInputProps) {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subNotes, setSubNotes] = useState<Omit<SubNote, 'id'>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiEnabled, setIsAiEnabled] = useState(true);
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
  ];

  const categories = ['Work', 'Personal', 'Shopping', 'Health', 'Learning', 'Travel'];
  const folders = ['Main', 'Projects', 'Ideas', 'Archive']; // Mock folders

  const addSubNote = (type: 'text' | 'checklist' | 'numbered') => {
    setSubNotes([...subNotes, {
      content: '',
      completed: false,
      type,
      order: subNotes.length
    }]);
  };

  const updateSubNote = (index: number, content: string) => {
    const updated = [...subNotes];
    updated[index].content = content;
    setSubNotes(updated);
  };

  const removeSubNote = (index: number) => {
    setSubNotes(subNotes.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSubNotes([]);
    setSelectedColor('#3B82F6');
    setSelectedCategory('');
    setSelectedFolder('');
    setPriority('medium');
    setIsExpanded(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isLoading) return;

    setIsLoading(true);
    
    try {
      let taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
        title: title.trim(),
        description: description.trim(),
        completed: false,
        priority,
        tags: selectedCategory ? [selectedCategory] : [],
        color: selectedColor,
        category: selectedCategory,
        folderId: selectedFolder || undefined,
        subNotes: subNotes.length > 0 ? subNotes.map((note, index) => ({
          ...note,
          id: `temp-${index}`
        })) : undefined
      };

      // Try AI parsing if enabled
      if (isAiEnabled && title.trim()) {
        try {
          const parsedTask = await aiService.parseTask(title.trim());
          if (parsedTask) {
            taskData = {
              ...taskData,
              priority: parsedTask.priority,
              tags: parsedTask.tags || taskData.tags,
            };
            
            if (parsedTask.deadline) {
              taskData = { ...taskData, deadline: parsedTask.deadline };
            }
          }
        } catch (error) {
          console.warn('AI parsing failed, using fallback:', error);
        }
      }

      const newTask = await TaskService.addTask(user?.uid || '', taskData);
      if (newTask) {
        onTaskAdded(newTask);
        resetForm();
      }
    } catch (error) {
      console.error('Error adding task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border-0 mb-6 overflow-hidden transition-all duration-300 hover:shadow-2xl">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <Plus className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Create Note</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsAiEnabled(!isAiEnabled)}
              className={cn(
                'flex items-center px-3 py-1 text-xs rounded-full transition-all duration-200',
                isAiEnabled
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              AI {isAiEnabled ? 'On' : 'Off'}
            </button>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', isExpanded && 'rotate-180')} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Input */}
          <div className="relative">
            <div className="absolute left-3 top-3 text-gray-400">
              <Type className="h-5 w-5" />
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              placeholder="Note title..."
              className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors text-lg font-medium"
              disabled={isLoading}
            />
          </div>

          {/* Expanded Content */}
          <div className={cn('space-y-4 transition-all duration-300', isExpanded ? 'opacity-100 max-h-none' : 'opacity-0 max-h-0 overflow-hidden')}>
            {/* Description */}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add description..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors resize-none"
              rows={3}
            />

            {/* Sub-notes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Sub-notes</label>
                <div className="flex space-x-1">
                  <button
                    type="button"
                    onClick={() => addSubNote('text')}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Add text note"
                  >
                    <Type className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => addSubNote('checklist')}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Add checklist"
                  >
                    <CheckSquare className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => addSubNote('numbered')}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Add numbered list"
                  >
                    <Hash className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {subNotes.map((note, index) => (
                <div key={index} className="flex items-center space-x-2 bg-gray-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-gray-500 min-w-0">
                    {note.type === 'checklist' ? '☐' : note.type === 'numbered' ? `${index + 1}.` : '•'}
                  </div>
                  <input
                    type="text"
                    value={note.content}
                    onChange={(e) => updateSubNote(index, e.target.value)}
                    placeholder={`${note.type === 'checklist' ? 'Checklist' : note.type === 'numbered' ? 'Numbered' : 'Text'} item...`}
                    className="flex-1 bg-transparent border-0 focus:ring-0 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeSubNote(index)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Options Row */}
            <div className="flex flex-wrap gap-3 items-center">
              {/* Color Picker */}
              <div className="flex items-center space-x-2">
                <Palette className="h-4 w-4 text-gray-500" />
                <div className="flex space-x-1">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        'w-6 h-6 rounded-full border-2 transition-all',
                        selectedColor === color ? 'border-gray-400 scale-110' : 'border-transparent'
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Category */}
              <div className="flex items-center space-x-2">
                <List className="h-4 w-4 text-gray-500" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-1 text-sm focus:border-blue-500 focus:ring-0"
                >
                  <option value="">Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Folder */}
              <div className="flex items-center space-x-2">
                <FolderOpen className="h-4 w-4 text-gray-500" />
                <select
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-1 text-sm focus:border-blue-500 focus:ring-0"
                >
                  <option value="">Folder</option>
                  {folders.map((folder) => (
                    <option key={folder} value={folder}>{folder}</option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div className="flex items-center space-x-1">
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={cn(
                      'px-3 py-1 text-xs rounded-full transition-colors',
                      priority === p
                        ? p === 'high' ? 'bg-red-100 text-red-700'
                          : p === 'medium' ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {isAiEnabled && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200">
                <p className="text-sm text-purple-700 flex items-center">
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI will automatically analyze your note for insights and suggestions
                </p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!title.trim() || isLoading}
              className={cn(
                'flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200',
                'bg-gradient-to-r from-blue-600 to-purple-600 text-white',
                'hover:from-blue-700 hover:to-purple-700 hover:shadow-lg hover:scale-105',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
              )}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              {isLoading ? 'Creating...' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}