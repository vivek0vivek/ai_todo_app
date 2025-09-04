'use client';

import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Target, 
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Zap,
  X,
  RefreshCw,
  Lightbulb
} from 'lucide-react';
import { Task, TaskStats } from '@/types';
import { cn } from '@/utils/cn';

interface AIInsight {
  id: string;
  type: 'priority' | 'timing' | 'productivity' | 'suggestion' | 'achievement';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  icon: React.ComponentType<any>;
  color: string;
}

interface AIInsightPanelProps {
  tasks: Task[];
  stats: TaskStats;
  isVisible: boolean;
  onClose: () => void;
}

export default function AIInsightPanel({ 
  tasks, 
  stats, 
  isVisible, 
  onClose 
}: AIInsightPanelProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);

  const generateInsights = async () => {
    setIsGenerating(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockInsights: AIInsight[] = [
      {
        id: '1',
        type: 'priority',
        title: 'High Priority Tasks Need Attention',
        description: `You have ${tasks.filter(t => t.priority === 'high' && !t.completed).length} high priority tasks that should be completed today for optimal productivity.`,
        confidence: 92,
        actionable: true,
        icon: AlertTriangle,
        color: 'text-red-600'
      },
      {
        id: '2',
        type: 'timing',
        title: 'Best Time to Work',
        description: 'Based on your completion patterns, you\'re most productive between 9-11 AM. Consider scheduling important tasks during this window.',
        confidence: 87,
        actionable: true,
        icon: Clock,
        color: 'text-blue-600'
      },
      {
        id: '3',
        type: 'productivity',
        title: 'Productivity Streak',
        description: `Great job! You've completed ${stats.completedToday} tasks today. You're on track to beat your weekly average.`,
        confidence: 95,
        actionable: false,
        icon: TrendingUp,
        color: 'text-green-600'
      },
      {
        id: '4',
        type: 'suggestion',
        title: 'Task Grouping Opportunity',
        description: 'Consider grouping similar tasks together. I found 3 tasks that could be batched for better efficiency.',
        confidence: 78,
        actionable: true,
        icon: Target,
        color: 'text-purple-600'
      },
      {
        id: '5',
        type: 'achievement',
        title: 'Weekly Goal Progress',
        description: `You're ${Math.round((stats.completedThisWeek / 20) * 100)}% towards your weekly goal of 20 completed tasks. Keep it up!`,
        confidence: 100,
        actionable: false,
        icon: CheckCircle2,
        color: 'text-green-600'
      }
    ];

    setInsights(mockInsights);
    setIsGenerating(false);
  };

  useEffect(() => {
    if (isVisible && insights.length === 0) {
      generateInsights();
    }
  }, [isVisible]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      priority: 'Priority Alert',
      timing: 'Timing Insight',
      productivity: 'Productivity',
      suggestion: 'Suggestion',
      achievement: 'Achievement'
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">AI Insights</h2>
                <p className="opacity-90">Personalized recommendations for your productivity</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={generateInsights}
                disabled={isGenerating}
                className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
              >
                <RefreshCw className={cn('h-5 w-5', isGenerating && 'animate-spin')} />
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex h-[600px]">
          {/* Insights List */}
          <div className="flex-1 p-6 overflow-y-auto">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <p className="text-lg font-medium text-gray-700 mb-2">Analyzing your tasks...</p>
                <p className="text-gray-500 text-center">AI is processing your productivity patterns and generating personalized insights</p>
              </div>
            ) : (
              <div className="space-y-4">
                {insights.map((insight) => {
                  const IconComponent = insight.icon;
                  const isSelected = selectedInsight?.id === insight.id;
                  
                  return (
                    <div
                      key={insight.id}
                      onClick={() => setSelectedInsight(insight)}
                      className={cn(
                        'p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg',
                        isSelected 
                          ? 'border-purple-300 bg-purple-50 shadow-md'
                          : 'border-gray-200 hover:border-purple-200'
                      )}
                    >
                      <div className="flex items-start space-x-4">
                        <div className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center',
                          insight.type === 'priority' ? 'bg-red-100' :
                          insight.type === 'timing' ? 'bg-blue-100' :
                          insight.type === 'productivity' ? 'bg-green-100' :
                          insight.type === 'suggestion' ? 'bg-purple-100' :
                          'bg-green-100'
                        )}>
                          <IconComponent className={cn('h-5 w-5', insight.color)} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {getTypeLabel(insight.type)}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className={cn('text-xs font-medium', getConfidenceColor(insight.confidence))}>
                                {insight.confidence}% confidence
                              </span>
                              {insight.actionable && (
                                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                                  Actionable
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <h3 className="font-semibold text-gray-900 mb-2">{insight.title}</h3>
                          <p className="text-gray-600 text-sm">{insight.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Detail Panel */}
          {selectedInsight && !isGenerating && (
            <div className="w-80 border-l border-gray-200 p-6 bg-gray-50">
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <selectedInsight.icon className={cn('h-8 w-8 mr-3', selectedInsight.color)} />
                  <div>
                    <h3 className="font-bold text-gray-900">{selectedInsight.title}</h3>
                    <span className="text-sm text-gray-500">{getTypeLabel(selectedInsight.type)}</span>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4">{selectedInsight.description}</p>
                
                {/* Confidence Meter */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Confidence Level</span>
                    <span className={cn('font-medium', getConfidenceColor(selectedInsight.confidence))}>
                      {selectedInsight.confidence}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${selectedInsight.confidence}%` }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedInsight.actionable && (
                  <div className="space-y-2">
                    <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 hover:scale-105">
                      <Zap className="h-4 w-4 inline mr-2" />
                      Apply Suggestion
                    </button>
                    <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                      <Lightbulb className="h-4 w-4 inline mr-2" />
                      Learn More
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}