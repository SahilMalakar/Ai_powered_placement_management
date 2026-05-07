'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AtsDetailedScoresProps {
  sectionScores: {
    label: string;
    score: number;
  }[];
  matchedKeywords: string[];
  missingKeywords: string[];
}

export function AtsDetailedScores({ sectionScores, matchedKeywords, missingKeywords }: AtsDetailedScoresProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
      {/* Left: Section Scores */}
      <Card className="p-6 border shadow-heavy bg-card/50 backdrop-blur-sm">
        <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-muted-foreground mb-6">
          Section Scores
        </h3>
        <div className="space-y-6">
          {sectionScores.map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-foreground/70 tracking-tight">{item.label}</span>
                <span className="text-foreground">{item.score}</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-1000 delay-300",
                    item.score >= 80 ? "bg-success" : item.score >= 60 ? "bg-warning" : "bg-error"
                  )}
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Right: Keywords */}
      <Card className="p-6 border shadow-heavy bg-card/50 backdrop-blur-sm flex flex-col">
        <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-muted-foreground mb-6">
          Keyword Match
        </h3>
        
        <div className="space-y-8 flex-1">
          {/* Matched */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-success uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Present in resume
            </div>
            <div className="flex flex-wrap gap-2">
              {matchedKeywords.length > 0 ? (
                matchedKeywords.map(kw => (
                  <Badge key={kw} variant="outline" className="bg-success/5 text-success border-success/20 font-medium px-2.5 py-0.5 rounded-md">
                    {kw}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground italic">No matches found</span>
              )}
            </div>
          </div>

          <div className="h-px bg-border/50" />

          {/* Missing */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-error uppercase tracking-wider">
              <AlertCircle className="w-3.5 h-3.5" />
              Missing from resume
            </div>
            <div className="flex flex-wrap gap-2">
              {missingKeywords.length > 0 ? (
                missingKeywords.map(kw => (
                  <Badge key={kw} variant="outline" className="bg-error/5 text-error border-error/20 font-medium px-2.5 py-0.5 rounded-md">
                    {kw}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground italic">No missing keywords found</span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
