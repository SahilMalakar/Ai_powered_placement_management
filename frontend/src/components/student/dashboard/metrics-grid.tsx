import { Card } from "@/components/ui/card";

export interface MetricsGridProps {
  eligibleDrivesCount: number;
  appliedCount: number;
  shortlistedCount: number;
  atsCreditsLeft: number;
}

export function MetricsGrid({
  eligibleDrivesCount,
  appliedCount,
  shortlistedCount,
  atsCreditsLeft,
}: MetricsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      
      {/* Metric 1: Eligible Drives */}
      <Card className="bg-card border border-border p-5 rounded-xl shadow-card dark:bg-[#141414] dark:border-[#202020] hover:border-slate-800 transition-all">
        <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase font-heading">
          Eligible Drives
        </span>
        <div className="text-4xl font-extrabold text-foreground mt-2 font-mono">
          {eligibleDrivesCount}
        </div>
        <p className="text-[11px] text-muted-foreground mt-1 font-body">
          matching branch & CGPA
        </p>
      </Card>

      {/* Metric 2: Applied */}
      <Card className="bg-card border border-border p-5 rounded-xl shadow-card dark:bg-[#141414] dark:border-[#202020] hover:border-slate-800 transition-all">
        <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase font-heading">
          Applied
        </span>
        <div className="text-4xl font-extrabold text-foreground mt-2 font-mono">
          {appliedCount}
        </div>
        <p className="text-[11px] text-muted-foreground mt-1 font-body">
          total attempts
        </p>
      </Card>

      {/* Metric 3: Shortlisted */}
      <Card className="bg-card border border-border p-5 rounded-xl shadow-card dark:bg-[#141414] dark:border-[#202020] hover:border-slate-800 transition-all">
        <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase font-heading">
          Shortlisted
        </span>
        <div className="text-4xl font-extrabold text-foreground mt-2 font-mono">
          {shortlistedCount}
        </div>
        <p className="text-[11px] text-muted-foreground mt-1 font-body">
          in interview pipeline
        </p>
      </Card>

      {/* Metric 4: ATS Credits */}
      <Card className="bg-card border border-border p-5 rounded-xl shadow-card dark:bg-[#141414] dark:border-[#202020] hover:border-slate-800 transition-all">
        <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase font-heading">
          ATS Credits
        </span>
        <div className="text-4xl font-extrabold text-foreground mt-2 font-mono">
          {atsCreditsLeft} <span className="text-sm font-normal text-muted-foreground">/ 5</span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1 font-body">
          daily credits left
        </p>
      </Card>

    </div>
  );
}
