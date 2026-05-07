'use client';

import { useParams, useRouter } from 'next/navigation';;
import { useAtsStatus } from '@/hooks/student/useAtsStatus';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { AtsProcessingState } from '@/components/student/ats/AtsProcessingState';
import { AtsScoreOverview } from '@/components/student/ats/AtsScoreOverview';
import { AtsDetailedScores } from '@/components/student/ats/AtsDetailedScores';
import { AtsFeedbackPanels } from '@/components/student/ats/AtsFeedbackPanels';

export default function AtsResultPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const { data: statusData, isLoading, error } = useAtsStatus(id);

  const handleBack = () => {
    router.push('/ats');
  };

  if (isLoading || statusData?.status === 'PENDING' || statusData?.status === 'PROCESSING') {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-8 min-h-[70vh] flex flex-col items-center justify-center">
        <AtsProcessingState />
      </div>
    );
  }

  if (error || statusData?.status === 'FAILED') {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-8 min-h-[70vh] flex flex-col items-center justify-center">
        <Card className="p-10 border-error/20 bg-error/5 flex flex-col items-center text-center space-y-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-error" />
          <h2 className="text-xl font-bold">Analysis Failed</h2>
          <p className="text-muted-foreground">
            We couldn't complete the analysis for this resume. This might be due to a transient error or a file processing issue.
          </p>
          <Button onClick={handleBack} variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  if (!statusData) return null;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="mb-2 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Analysis Result</h1>
        </div>
      </div>

      <AtsScoreOverview
        score={statusData.score || 0}
        detectedRole={statusData.detectedRole || 'Unknown Role'}
        analysisMode={statusData.analysisMode || 'GENERIC'}
        createdAt={statusData.createdAt}
      />

      <AtsDetailedScores
        sectionScores={[
          { label: 'Keywords & skills', score: statusData.keywordScore || 0 },
          { label: 'Work experience', score: statusData.experienceScore || 0 },
          { label: 'Projects', score: statusData.projectScore || 0 },
          { label: 'Skills section', score: statusData.skillsScore || 0 },
          { label: 'Format & structure', score: statusData.formatScore || 0 },
          { label: 'Contact & summary', score: statusData.additionalDetailsScore || 0 },
        ]}
        matchedKeywords={statusData.matchedKeywords || []}
        missingKeywords={statusData.missingKeywords || []}
      />

      <AtsFeedbackPanels
        strengths={statusData.strengths || []}
        weaknesses={statusData.weaknesses || []}
        suggestions={statusData.suggestions || []}
      />
    </div>
  );
}
