import { Task, TaskStats } from '@/types';

const STORAGE_KEY = 'ai-todo-tasks';
const INSIGHTS_KEY = 'ai-todo-insights';

export class TaskService {
  static getTasks(): Task[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const tasks = JSON.parse(stored);
      return tasks.map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        deadline: task.deadline ? new Date(task.deadline) : undefined,
      }));
    } catch (error) {
      console.error('Error loading tasks:', error);
      return [];
    }
  }

  static saveTasks(tasks: Task[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  }

  static addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const tasks = this.getTasks();
    tasks.unshift(newTask);
    this.saveTasks(tasks);
    
    return newTask;
  }

  static updateTask(id: string, updates: Partial<Task>): Task | null {
    const tasks = this.getTasks();
    const taskIndex = tasks.findIndex(t => t.id === id);
    
    if (taskIndex === -1) return null;
    
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...updates,
      updatedAt: new Date(),
    };
    
    this.saveTasks(tasks);
    return tasks[taskIndex];
  }

  static deleteTask(id: string): boolean {
    const tasks = this.getTasks();
    const filteredTasks = tasks.filter(t => t.id !== id);
    
    if (filteredTasks.length === tasks.length) return false;
    
    this.saveTasks(filteredTasks);
    return true;
  }

  static getStats(): TaskStats {
    const tasks = this.getTasks();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
    
    const completed = tasks.filter(t => t.completed);
    const pending = tasks.filter(t => !t.completed);
    const overdue = pending.filter(t => t.deadline && new Date(t.deadline) < now);
    const completedToday = completed.filter(t => new Date(t.updatedAt) >= today);
    const completedThisWeek = completed.filter(t => new Date(t.updatedAt) >= weekStart);

    return {
      total: tasks.length,
      completed: completed.length,
      pending: pending.length,
      overdue: overdue.length,
      completedToday: completedToday.length,
      completedThisWeek: completedThisWeek.length,
    };
  }
}