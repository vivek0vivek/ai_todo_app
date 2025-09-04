'use client';

import React, { useState } from 'react';
import { 
  FolderOpen, 
  Plus, 
  Settings, 
  FileText, 
  Image, 
  Paperclip,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Edit,
  Trash2,
  Archive
} from 'lucide-react';
import { Folder } from '@/types';
import { cn } from '@/utils/cn';

interface FolderSidebarProps {
  folders: Folder[];
  selectedFolder?: string;
  onSelectFolder: (folderId: string) => void;
  onCreateFolder: () => void;
  className?: string;
}

const mockFolders: Folder[] = [
  {
    id: 'main',
    name: 'Main',
    color: '#3B82F6',
    icon: 'folder',
    userId: 'user',
    createdAt: new Date(),
    storageUsed: 2.5,
    storageLimit: 100
  },
  {
    id: 'projects',
    name: 'Work Projects',
    color: '#F59E0B',
    icon: 'briefcase',
    userId: 'user',
    createdAt: new Date(),
    storageUsed: 15.8,
    storageLimit: 100
  },
  {
    id: 'personal',
    name: 'Personal',
    color: '#10B981',
    icon: 'heart',
    userId: 'user',
    createdAt: new Date(),
    storageUsed: 8.2,
    storageLimit: 50
  },
  {
    id: 'ideas',
    name: 'Ideas & Inspiration',
    color: '#8B5CF6',
    icon: 'lightbulb',
    userId: 'user',
    createdAt: new Date(),
    storageUsed: 4.6,
    storageLimit: 25
  },
  {
    id: 'archive',
    name: 'Archive',
    color: '#6B7280',
    icon: 'archive',
    userId: 'user',
    createdAt: new Date(),
    storageUsed: 32.1,
    storageLimit: 200
  }
];

export default function FolderSidebar({ 
  folders = mockFolders, 
  selectedFolder, 
  onSelectFolder, 
  onCreateFolder,
  className 
}: FolderSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const getStoragePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  const getStorageColor = (percentage: number) => {
    if (percentage < 70) return 'bg-green-500';
    if (percentage < 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const iconMap: { [key: string]: React.ComponentType<any> } = {
    folder: FolderOpen,
    briefcase: FileText,
    heart: FolderOpen,
    lightbulb: FolderOpen,
    archive: Archive
  };

  return (
    <div className={cn(
      'bg-white border-r border-gray-200 flex flex-col transition-all duration-300',
      isCollapsed ? 'w-16' : 'w-72',
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="font-semibold text-gray-900 flex items-center">
              <FolderOpen className="h-5 w-5 mr-2 text-blue-600" />
              Folders
            </h2>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Folders List */}
      <div className="flex-1 overflow-y-auto py-2">
        {folders.map((folder) => {
          const IconComponent = iconMap[folder.icon] || FolderOpen;
          const isExpanded = expandedFolders.has(folder.id);
          const isSelected = selectedFolder === folder.id;
          const storagePercentage = getStoragePercentage(folder.storageUsed, folder.storageLimit);

          return (
            <div key={folder.id} className="px-2">
              {/* Folder Item */}
              <div
                className={cn(
                  'group flex items-center w-full p-3 rounded-xl transition-all duration-200 cursor-pointer',
                  isSelected 
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500'
                    : 'hover:bg-gray-50'
                )}
                onClick={() => onSelectFolder(folder.id)}
              >
                {/* Expand/Collapse Button */}
                {!isCollapsed && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFolder(folder.id);
                    }}
                    className="p-0.5 hover:bg-gray-200 rounded mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-3 w-3 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-3 w-3 text-gray-500" />
                    )}
                  </button>
                )}

                {/* Folder Icon */}
                <div className="flex-shrink-0">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: folder.color + '20' }}
                  >
                    <IconComponent 
                      className="h-4 w-4" 
                      style={{ color: folder.color }}
                    />
                  </div>
                </div>

                {/* Folder Info */}
                {!isCollapsed && (
                  <div className="flex-1 ml-3 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">
                        {folder.name}
                      </h3>
                      <button className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded transition-all">
                        <MoreHorizontal className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                    
                    {/* Storage Indicator */}
                    <div className="mt-1">
                      <div className="flex items-center text-xs text-gray-500 mb-1">
                        <span>{folder.storageUsed}MB / {folder.storageLimit}MB</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={cn(
                            'h-1.5 rounded-full transition-all duration-300',
                            getStorageColor(storagePercentage)
                          )}
                          style={{ width: `${storagePercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Expanded Content */}
              {!isCollapsed && isExpanded && (
                <div className="ml-6 mt-2 space-y-1 animate-fade-in">
                  {/* File Types */}
                  <div className="grid grid-cols-3 gap-2 p-2 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <FileText className="h-4 w-4 text-blue-500 mx-auto mb-1" />
                      <div className="text-xs text-gray-600">12</div>
                    </div>
                    <div className="text-center">
                      <Image className="h-4 w-4 text-green-500 mx-auto mb-1" />
                      <div className="text-xs text-gray-600">5</div>
                    </div>
                    <div className="text-center">
                      <Paperclip className="h-4 w-4 text-purple-500 mx-auto mb-1" />
                      <div className="text-xs text-gray-600">3</div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex space-x-1 pt-2">
                    <button className="flex-1 p-1.5 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors">
                      <Edit className="h-3 w-3 inline mr-1" />
                      Edit
                    </button>
                    <button className="flex-1 p-1.5 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors">
                      <Trash2 className="h-3 w-3 inline mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Folder Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onCreateFolder}
          className={cn(
            'w-full flex items-center justify-center p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 hover:scale-105 shadow-lg',
            isCollapsed && 'px-2'
          )}
        >
          <Plus className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">New Folder</span>}
        </button>
      </div>
    </div>
  );
}