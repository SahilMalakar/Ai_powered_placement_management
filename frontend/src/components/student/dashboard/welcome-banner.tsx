import { Card } from "@/components/ui/card";

export interface WelcomeBannerProps {
  displayName: string;
  displayBranch: string;
  displayCgpa: string;
  displayBacklog: string;
  displayVerification: string;
}

export function WelcomeBanner({
  displayName,
  displayBranch,
  displayCgpa,
  displayBacklog,
  displayVerification,
}: WelcomeBannerProps) {
  return (
    <Card className="relative overflow-hidden rounded-xl border border-border bg-card p-6 md:p-8 shadow-card flex flex-col md:flex-row justify-between items-start md:items-center gap-6 dark:bg-[#141414] dark:border-[#202020]">
      
      {/* Subtle Decorative Background Light Spot */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-brand-blue/10 to-brand-indigo/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

      <div className="space-y-3 relative z-10">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground font-heading">
          Welcome back, {displayName}!
        </h1>
        <p className="text-sm text-muted-foreground font-body">
          Your placement readiness roadmap — applications, resumes & prep tools.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <span className="bg-[#1a1a1a] border border-[#2a2a2a] text-slate-300 font-mono text-[11px] px-3 py-1.5 rounded-md shadow-sm">
            Branch: {displayBranch}
          </span>
          <span className="bg-[#1a1a1a] border border-[#2a2a2a] text-slate-300 font-mono text-[11px] px-3 py-1.5 rounded-md shadow-sm">
            CGPA: {displayCgpa}
          </span>
          <span className="bg-[#1a1a1a] border border-[#2a2a2a] text-slate-300 font-mono text-[11px] px-3 py-1.5 rounded-md shadow-sm">
            {displayBacklog}
          </span>
        </div>
      </div>

      {/* Academic Records Verification Badge */}
      <div className="relative z-10 shrink-0 border border-success/30 bg-success/5 rounded-lg px-6 py-3 min-w-[170px] text-center shadow-sm">
        <div className="text-[10px] font-bold tracking-widest text-success/80 font-heading uppercase">
          Academic Records
        </div>
        <div className="text-sm font-semibold tracking-wide text-success mt-1">
          {displayVerification === "VERIFIED" 
            ? "Verified & Eligible" 
            : displayVerification === "PROCESSING" 
            ? "OCR Processing..." 
            : "Verification Pending"}
        </div>
      </div>
    </Card>
  );
}
