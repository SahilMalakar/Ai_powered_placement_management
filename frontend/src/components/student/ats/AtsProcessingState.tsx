'use client';

import React from 'react';

export function AtsProcessingState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6 animate-in fade-in duration-700">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <div className="absolute inset-4 rounded-full bg-primary/10 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-primary animate-pulse" />
        </div>
      </div>
      
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <h3 className="text-xl font-bold tracking-tight">Analyzing your resume</h3>
        </div>
        <p className="text-muted-foreground text-sm max-w-[280px]">
          Our AI is comparing your profile against {Math.random() > 0.5 ? 'the job description' : 'industry standards'}...
        </p>
      </div>

      <div className="w-full max-w-md h-1.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-brand-blue to-brand-indigo animate-shimmer" style={{ width: '60%', backgroundSize: '200% 100%' }} />
      </div>

      <p className="text-[10px] uppercase font-bold text-muted-foreground/50 tracking-[0.2em]">
        this usually takes 10-20 seconds
      </p>
    </div>
  );
}
