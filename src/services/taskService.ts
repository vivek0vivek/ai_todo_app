// Dynamic imports for Firestore to avoid build issues
import { getFirebaseInstances } from '@/lib/firebase';
import { Task, TaskStats } from '@/types';

const TASKS_COLLECTION = 'tasks';
const STORAGE_KEY = 'ai-todo-tasks';
const INSIGHTS_KEY = 'ai-todo-insights';

export class TaskService {
  // Firestore methods for authenticated users
  static async getTasks(userId: string): Promise<Task[]> {
    if (!userId) return this.getLocalTasks();
    
    // Check if running in browser environment
    if (typeof window === 'undefined') return [];
    
    try {
      const { db } = await getFirebaseInstances();
      
      if (!db) {
        console.warn('📦 Firestore not initialized, using localStorage');
        return this.getLocalTasks();
      }
      
      const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
      
      const tasksRef = collection(db, TASKS_COLLECTION);
      const q = query(
        tasksRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        deadline: doc.data().deadline?.toDate()
      })) as Task[];
    } catch (error) {
      console.error('Error getting tasks from Firestore, falling back to localStorage:', error);
      return this.getLocalTasks();
    }
  }

  static async addTask(userId: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task | null> {
    if (!userId) return this.addLocalTask(task);
    
    // Check if running in browser environment
    if (typeof window === 'undefined') return this.addLocalTask(task);
    
    try {
      const { db } = await getFirebaseInstances();
      
      if (!db) {
        console.warn('📦 Firestore not initialized, using localStorage');
        return this.addLocalTask(task);
      }
      
      const { collection, addDoc, Timestamp } = await import('firebase/firestore');
      
      const tasksRef = collection(db, TASKS_COLLECTION);
      const newTask = {
        ...task,
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        deadline: task.deadline ? Timestamp.fromDate(task.deadline) : null
      };
      
      const docRef = await addDoc(tasksRef, newTask);
      return {
        ...task,
        id: docRef.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error adding task to Firestore, falling back to localStorage:', error);
      return this.addLocalTask(task);
    }
  }

  static async updateTask(userId: string, taskId: string, updates: Partial<Task>): Promise<Task | null> {
    if (!userId) return this.updateLocalTask(taskId, updates);
    
    // Check if running in browser environment
    if (typeof window === 'undefined') return this.updateLocalTask(taskId, updates);
    
    try {
      const { db } = await getFirebaseInstances();
      
      if (!db) {
        console.warn('📦 Firestore not initialized, using localStorage');
        return this.updateLocalTask(taskId, updates);
      }
      
      const { doc, updateDoc, Timestamp } = await import('firebase/firestore');
      
      const taskRef = doc(db, TASKS_COLLECTION, taskId);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
        deadline: updates.deadline ? Timestamp.fromDate(updates.deadline) : null
      };
      
      await updateDoc(taskRef, updateData);
      return { ...updates, id: taskId } as Task;
    } catch (error) {
      console.error('Error updating task in Firestore, falling back to localStorage:', error);
      return this.updateLocalTask(taskId, updates);
    }
  }

  static async deleteTask(userId: string, taskId: string): Promise<boolean> {
    if (!userId) return this.deleteLocalTask(taskId);
    
    // Check if running in browser environment
    if (typeof window === 'undefined') return this.deleteLocalTask(taskId);
    
    try {
      const { db } = await getFirebaseInstances();
      
      if (!db) {
        console.warn('📦 Firestore not initialized, using localStorage');
        return this.deleteLocalTask(taskId);
      }
      
      const { doc, deleteDoc } = await import('firebase/firestore');
      
      const taskRef = doc(db, TASKS_COLLECTION, taskId);
      await deleteDoc(taskRef);
      return true;
    } catch (error) {
      console.error('Error deleting task from Firestore, falling back to localStorage:', error);
      return this.deleteLocalTask(taskId);
    }
  }

  // Fallback localStorage methods (for offline/unauthenticated users)
  static getLocalTasks(): Task[] {
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

  static saveLocalTasks(tasks: Task[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  }

  static addLocalTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const tasks = this.getLocalTasks();
    tasks.unshift(newTask);
    this.saveLocalTasks(tasks);
    
    return newTask;
  }

  static updateLocalTask(id: string, updates: Partial<Task>): Task | null {
    const tasks = this.getLocalTasks();
    const taskIndex = tasks.findIndex(t => t.id === id);
    
    if (taskIndex === -1) return null;
    
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...updates,
      updatedAt: new Date(),
    };
    
    this.saveLocalTasks(tasks);
    return tasks[taskIndex];
  }

  static deleteLocalTask(id: string): boolean {
    const tasks = this.getLocalTasks();
    const filteredTasks = tasks.filter(t => t.id !== id);
    
    if (filteredTasks.length === tasks.length) return false;
    
    this.saveLocalTasks(filteredTasks);
    return true;
  }

  static getStats(tasks: Task[]): TaskStats {
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

  // Real-time subscription for authenticated users
  static async subscribeToTasks(userId: string, callback: (tasks: Task[]) => void): Promise<() => void> {
    if (!userId || typeof window === 'undefined') return () => {};

    try {
      const { db } = await getFirebaseInstances();
      
      if (!db) {
        console.warn('📦 Firestore not initialized, subscription not available');
        return () => {};
      }
      
      const { collection, query, where, orderBy, onSnapshot } = await import('firebase/firestore');
      
      const tasksRef = collection(db, TASKS_COLLECTION);
      const q = query(
        tasksRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      return onSnapshot(q, (snapshot) => {
        const tasks = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
          deadline: doc.data().deadline?.toDate()
        })) as Task[];
        
        callback(tasks);
      });
    } catch (error) {
      console.error('Error setting up Firestore subscription:', error);
      return () => {};
    }
  }
}