'use client';

import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AtsScoreOverviewProps {
  score: number;
  detectedRole: string;
  analysisMode: 'GENERIC' | 'JD_MATCHED';
  createdAt: string;
}

export function AtsScoreOverview({ score, detectedRole, analysisMode, createdAt }: AtsScoreOverviewProps) {
  const date = new Date(createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="bg-card rounded-2xl border p-8 shadow-heavy relative overflow-hidden animate-in zoom-in-95 duration-500">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />

      <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
        {/* Circular Progress */}
        <div className="relative flex-shrink-0">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="58"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-muted/20"
            />
            <circle
              cx="64"
              cy="64"
              r="58"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={364}
              strokeDashoffset={364 - (364 * score) / 100}
              className={cn(
                "transition-all duration-1000 ease-out",
                score >= 80 ? "text-success" : score >= 60 ? "text-warning" : "text-error"
              )}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold tracking-tighter">{score}</span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Score</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left space-y-3">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <Badge variant="secondary" className={cn(
              "px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full",
              analysisMode === 'JD_MATCHED' ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground"
            )}>
              {analysisMode === 'JD_MATCHED' ? 'JD Matched' : 'Generic Analysis'}
            </Badge>
          </div>

          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground/90">{detectedRole}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Detected role · Analyzed against {analysisMode === 'JD_MATCHED' ? 'job description' : 'industry best practices'}
            </p>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Calendar className="w-3.5 h-3.5" />
              Analyzed on {date}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
