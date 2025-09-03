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

export interface AIService {
  parseTask: (input: string) => Promise<ParsedTaskInput | null>;
  rankTasks: (tasks: Task[]) => Promise<Task[]>;
  generateDailyInsights: (tasks: Task[]) => Promise<AIInsight[]>;
  isAvailable: () => Promise<boolean>;
}