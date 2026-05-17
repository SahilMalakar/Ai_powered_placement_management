import { Skeleton } from "@/components/ui/skeleton";

interface TeamStatsProps {
  isLoading: boolean;
  stats: {
    total: number;
    activeSuper: number;
    activeAdmin: number;
    deactivated: number;
  };
}

export function TeamStats({ isLoading, stats }: TeamStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-card rounded-xl border border-border/50 p-4 shadow-heavy dark:shadow-[0_12px_36px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.04)] flex flex-col justify-between h-24 animate-in fade-in duration-500">
        <span className="text-xs font-bold text-mist uppercase tracking-wider">Total Members</span>
        <span className="text-2xl font-bold font-heading text-foreground mt-2">
          {isLoading ? <Skeleton className="h-8 w-12" /> : stats.total}
        </span>
      </div>
      <div className="bg-card rounded-xl border border-border/50 p-4 shadow-heavy dark:shadow-[0_12px_36px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.04)] flex flex-col justify-between h-24 animate-in fade-in duration-500">
        <span className="text-xs font-bold text-[#818cf8] uppercase tracking-wider">Active Super Admins</span>
        <span className="text-2xl font-bold font-heading text-[#818cf8] mt-2">
          {isLoading ? <Skeleton className="h-8 w-12" /> : stats.activeSuper}
        </span>
      </div>
      <div className="bg-card rounded-xl border border-border/50 p-4 shadow-heavy dark:shadow-[0_12px_36px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.04)] flex flex-col justify-between h-24 animate-in fade-in duration-500">
        <span className="text-xs font-bold text-teal-blue uppercase tracking-wider">Active Admins</span>
        <span className="text-2xl font-bold font-heading text-teal-blue mt-2">
          {isLoading ? <Skeleton className="h-8 w-12" /> : stats.activeAdmin}
        </span>
      </div>
      <div className="bg-card rounded-xl border border-border/50 p-4 shadow-heavy dark:shadow-[0_12px_36px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.04)] flex flex-col justify-between h-24 animate-in fade-in duration-500">
        <span className="text-xs font-bold text-error uppercase tracking-wider">Deactivated</span>
        <span className="text-2xl font-bold font-heading text-error mt-2">
          {isLoading ? <Skeleton className="h-8 w-12" /> : stats.deactivated}
        </span>
      </div>
    </div>
  );
}
