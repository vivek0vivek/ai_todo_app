import { GoogleGenerativeAI } from '@google/generative-ai';
import { Task, ParsedTaskInput, AIInsight, AIService } from '@/types';

class GeminiAIService implements AIService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      // Use client-side environment variable
      const apiKey = typeof window !== 'undefined' 
        ? process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyBfOsE1qhRdidAyLOzb4AY1jM2VJ4Zvp0o' 
        : null;
        
      if (apiKey) {
        console.log('🤖 Initializing AI service with Gemini API...');
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
        this.isInitialized = true;
        console.log('✅ AI service initialized successfully!');
      } else {
        console.warn('⚠️ Gemini API key not found');
      }
    } catch (error) {
      console.error('❌ Failed to initialize AI service:', error);
      this.isInitialized = false;
    }
  }

  async isAvailable(): Promise<boolean> {
    return this.isInitialized && this.model !== null;
  }

  async parseTask(input: string): Promise<ParsedTaskInput | null> {
    if (!await this.isAvailable()) return null;

    try {
      const prompt = `
        Parse the following task input into structured data. Extract:
        - title (required)
        - deadline (optional, parse natural language dates)
        - priority (low, medium, high based on urgency indicators)
        - tags (optional, extract relevant keywords)

        Input: "${input}"

        Respond with valid JSON only:
        {
          "title": "string",
          "deadline": "ISO date string or null",
          "priority": "low|medium|high",
          "tags": ["array", "of", "strings"]
        }

        Examples:
        Input: "Buy groceries tomorrow"
        Output: {"title": "Buy groceries", "deadline": "2024-01-02T00:00:00.000Z", "priority": "medium", "tags": ["shopping", "groceries"]}

        Input: "URGENT: Fix the bug in auth system"
        Output: {"title": "Fix the bug in auth system", "deadline": null, "priority": "high", "tags": ["urgent", "bug", "auth"]}
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        title: parsed.title || input,
        deadline: parsed.deadline ? new Date(parsed.deadline) : undefined,
        priority: parsed.priority || 'medium',
        tags: Array.isArray(parsed.tags) ? parsed.tags : undefined,
      };
    } catch (error) {
      console.error('Error parsing task:', error);
      return null;
    }
  }

  async rankTasks(tasks: Task[]): Promise<Task[]> {
    if (!await this.isAvailable()) return tasks;
    if (tasks.length === 0) return tasks;

    try {
      const prompt = `
        Rank these tasks by priority considering:
        - Deadline urgency
        - Priority level (high > medium > low)
        - Creation date (older tasks get slight priority boost)
        
        Tasks:
        ${tasks.map((task, index) => `
          ${index}: ${task.title}
          - Priority: ${task.priority}
          - Deadline: ${task.deadline ? task.deadline.toISOString() : 'none'}
          - Created: ${task.createdAt.toISOString()}
        `).join('')}

        Respond with just the reordered indices as JSON array: [2, 0, 1, 3, ...]
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\[[\d\s,]*\]/);
      if (!jsonMatch) return tasks;
      
      const indices = JSON.parse(jsonMatch[0]);
      return indices.map((i: number) => tasks[i]).filter(Boolean);
    } catch (error) {
      console.error('Error ranking tasks:', error);
      return tasks;
    }
  }

  async generateDailyInsights(tasks: Task[]): Promise<AIInsight[]> {
    if (!await this.isAvailable()) return [];
    if (tasks.length === 0) return [];

    try {
      const completedToday = tasks.filter(t => 
        t.completed && 
        new Date(t.updatedAt).toDateString() === new Date().toDateString()
      );
      
      const overdue = tasks.filter(t => 
        !t.completed && 
        t.deadline && 
        new Date(t.deadline) < new Date()
      );

      const prompt = `
        Generate 2-3 brief insights about today's productivity based on this data:
        
        Total tasks: ${tasks.length}
        Completed today: ${completedToday.length}
        Overdue tasks: ${overdue.length}
        High priority pending: ${tasks.filter(t => !t.completed && t.priority === 'high').length}

        Sample completed tasks: ${completedToday.slice(0, 3).map(t => t.title).join(', ')}
        Sample overdue tasks: ${overdue.slice(0, 3).map(t => t.title).join(', ')}

        Respond with JSON array of insights:
        [
          {"type": "summary", "content": "brief summary"},
          {"type": "suggestion", "content": "actionable suggestion"},
          {"type": "priority", "content": "priority recommendation"}
        ]

        Keep each insight under 50 words.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return [];
      
      const insights = JSON.parse(jsonMatch[0]);
      return insights.map((insight: any, index: number) => ({
        id: `insight-${Date.now()}-${index}`,
        type: insight.type || 'summary',
        content: insight.content,
        createdAt: new Date(),
        isRead: false,
      }));
    } catch (error) {
      console.error('Error generating insights:', error);
      return [];
    }
  }
}

export const aiService = new GeminiAIService();