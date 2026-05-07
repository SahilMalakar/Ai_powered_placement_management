'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AtsFeedbackPanelsProps {
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export function AtsFeedbackPanels({ strengths, weaknesses, suggestions }: AtsFeedbackPanelsProps) {
  const sections = [
    {
      title: 'Strengths',
      items: strengths,
      icon: CheckCircle2,
      color: 'text-success',
      bg: 'bg-success/5',
      border: 'border-success/20',
      dot: 'bg-success'
    },
    {
      title: 'Weaknesses',
      items: weaknesses,
      icon: AlertCircle,
      color: 'text-error',
      bg: 'bg-error/5',
      border: 'border-error/20',
      dot: 'bg-error'
    },
    {
      title: 'Suggestions',
      items: suggestions,
      icon: Lightbulb,
      color: 'text-primary',
      bg: 'bg-primary/5',
      border: 'border-primary/20',
      dot: 'bg-primary'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
      {sections.map((section, idx) => (
        <Card 
          key={section.title} 
          className={cn(
            "p-6 border shadow-heavy flex flex-col h-full",
            section.bg,
            section.border
          )}
        >
          <div className="flex items-center gap-2 mb-6">
            <section.icon className={cn("w-5 h-5", section.color)} />
            <h3 className={cn("text-base font-bold tracking-tight", section.color)}>
              {section.title}
            </h3>
          </div>
          
          <ul className="space-y-4 flex-1">
            {section.items.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-muted-foreground group">
                <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 transition-transform duration-300 group-hover:scale-125", section.dot)} />
                <span className="group-hover:text-foreground transition-colors duration-200">{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
