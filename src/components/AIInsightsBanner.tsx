'use client';

import React, { useState, useEffect } from 'react';
import { AIInsight } from '@/types';
import { aiService } from '@/services/aiService';
import { TaskService } from '@/services/taskService';
import { 
  Sparkles, 
  X, 
  RefreshCw, 
  Lightbulb,
  TrendingUp,
  AlertCircle 
} from 'lucide-react';
import { cn } from '@/utils/cn';

export default function AIInsightsBanner() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dismissedInsights, setDismissedInsights] = useState<string[]>([]);

  useEffect(() => {
    generateInsights();
  }, []);

  const generateInsights = async () => {
    setIsLoading(true);
    try {
      const tasks = TaskService.getTasks();
      const newInsights = await aiService.generateDailyInsights(tasks);
      setInsights(newInsights);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const dismissInsight = (insightId: string) => {
    setDismissedInsights(prev => [...prev, insightId]);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'suggestion':
        return Lightbulb;
      case 'priority':
        return AlertCircle;
      case 'summary':
        return TrendingUp;
      default:
        return Sparkles;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'suggestion':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'priority':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'summary':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-purple-50 border-purple-200 text-purple-800';
    }
  };

  const visibleInsights = insights.filter(insight => 
    !dismissedInsights.includes(insight.id)
  );

  if (visibleInsights.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className="card mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Sparkles className="h-5 w-5 text-purple-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">AI Insights</h2>
        </div>
        <button
          onClick={generateInsights}
          disabled={isLoading}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8 text-gray-500">
          <Sparkles className="h-5 w-5 animate-pulse mr-2" />
          Generating AI insights...
        </div>
      ) : (
        <div className="space-y-3">
          {visibleInsights.map((insight) => {
            const IconComponent = getInsightIcon(insight.type);
            return (
              <div
                key={insight.id}
                className={cn(
                  'p-4 rounded-lg border flex items-start gap-3',
                  getInsightColor(insight.type)
                )}
              >
                <IconComponent className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1 capitalize">
                    {insight.type === 'summary' ? 'Daily Summary' : 
                     insight.type === 'suggestion' ? 'Suggestion' : 
                     'Priority Alert'}
                  </p>
                  <p className="text-sm">{insight.content}</p>
                </div>
                <button
                  onClick={() => dismissInsight(insight.id)}
                  className="flex-shrink-0 p-1 hover:bg-black/5 rounded-md transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {visibleInsights.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No insights available. Add some tasks to get AI-powered suggestions!</p>
        </div>
      )}
    </div>
  );
}