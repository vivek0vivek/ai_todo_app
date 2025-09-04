export interface SubNote {
  id: string;
  content: string;
  completed: boolean;
  type: 'text' | 'checklist' | 'numbered';
  order: number;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document' | 'link';
  size?: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  deadline?: Date;
  priority: 'low' | 'medium' | 'high';
  tags?: string[];
  userId?: string;
  subNotes?: SubNote[];
  attachments?: Attachment[];
  category?: string;
  color?: string;
  folderId?: string;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export interface AIInsight {
  id: string;
  type: 'suggestion' | 'priority' | 'summary';
  content: string;
  createdAt: Date;
  isRead: boolean;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completedToday: number;
  completedThisWeek: number;
}

export interface ParsedTaskInput {
  title: string;
  deadline?: Date;
  priority: 'low' | 'medium' | 'high';
  tags?: string[];
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  icon: string;
  userId: string;
  createdAt: Date;
  storageUsed: number;
  storageLimit: number;
}

export interface AIService {
  parseTask: (input: string) => Promise<ParsedTaskInput | null>;
  rankTasks: (tasks: Task[]) => Promise<Task[]>;
  generateDailyInsights: (tasks: Task[]) => Promise<AIInsight[]>;
  isAvailable: () => Promise<boolean>;
}