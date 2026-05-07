'use client';

import { useRouter } from 'next/navigation';
import { useAtsAnalyze } from '@/hooks/student/useAtsAnalyze';
import { useAtsHistory } from '@/hooks/student/useAtsHistory';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, ChevronRight, History } from 'lucide-react';
import { AtsUploadSection } from '@/components/student/ats/AtsUploadSection';

export default function ATSAnalyzerPage() {
  const router = useRouter();

  const { mutate: analyze, isPending: isAnalyzing } = useAtsAnalyze({
    onSuccess: (id) => {
      router.push(`/ats/${id}`);
    }
  });

  const { data: historyData } = useAtsHistory(1, 10);

  const handleAnalyze = (file: File, jd: string) => {
    const formData = new FormData();
    formData.append('resume', file);
    if (jd) formData.append('jobDescription', jd);
    analyze(formData);
  };

  const handleViewHistoryItem = (id: number) => {
    router.push(`/ats/${id}`);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-12 min-h-screen pb-20">
      {/* Header */}
      <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-500">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          ATS Analyzer
        </h1>
        <p className="text-muted-foreground text-lg">
          Maximize your hiring chances with AI-powered resume insights.
        </p>
      </div>

      <div className="space-y-16">
        {/* Main Interface */}
        <section>
          <AtsUploadSection onAnalyze={handleAnalyze} isPending={isAnalyzing} />
        </section>

        {/* History Section */}
        {historyData && historyData.results.length > 0 && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
            <div className="flex items-center gap-2 text-foreground/80">
              <History className="w-5 h-5" />
              <h2 className="text-xl font-bold tracking-tight">Recent Analyses</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {historyData.results.map((item) => (
                <Card
                  key={item.id}
                  onClick={() => handleViewHistoryItem(item.id)}
                  className="group p-5 border bg-card hover:border-primary/30 hover:shadow-md transition-all duration-300 cursor-pointer flex items-center gap-4"
                >
                  <div className="p-3 rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <FileText className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold truncate">{item.detectedRole}</h4>
                      <Badge variant="outline" className="text-[9px] uppercase h-4 px-1.5 font-bold">
                        {item.score}%
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
