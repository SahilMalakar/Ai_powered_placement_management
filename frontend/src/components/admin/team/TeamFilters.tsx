import { Search } from "lucide-react";

interface TeamFiltersProps {
  search: string;
  setSearch: (s: string) => void;
  roleFilter: "ALL" | "ADMIN" | "SUPER_ADMIN";
  setRoleFilter: (r: "ALL" | "ADMIN" | "SUPER_ADMIN") => void;
  statusFilter: "ALL" | "ACTIVE" | "DEACTIVATED";
  setStatusFilter: (s: "ALL" | "ACTIVE" | "DEACTIVATED") => void;
}

export function TeamFilters({
  search,
  setSearch,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
}: TeamFiltersProps) {
  return (
    <div className="bg-card rounded-xl border border-border/50 p-4 shadow-heavy dark:shadow-[0_12px_36px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.04)] flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
      
      {/* Search Input */}
      <div className="relative flex-1 max-w-md animate-in fade-in duration-500">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent pl-9 pr-4 py-2 border border-input rounded-md text-sm outline-hidden focus:border-ring focus:ring-2 focus:ring-ring/20 dark:bg-[#141414]"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Status Segmented Control */}
        <div className="flex bg-muted/30 dark:bg-[#141414] border border-border rounded-lg p-0.5 self-start">
          <button
            onClick={() => setStatusFilter("ACTIVE")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer border-none ${
              statusFilter === "ACTIVE"
                ? "bg-card text-foreground shadow-subtle font-sans"
                : "text-muted-foreground hover:text-foreground font-sans"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setStatusFilter("DEACTIVATED")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer border-none ${
              statusFilter === "DEACTIVATED"
                ? "bg-card text-foreground shadow-subtle font-sans"
                : "text-muted-foreground hover:text-foreground font-sans"
            }`}
          >
            Deactivated
          </button>
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer border-none ${
              statusFilter === "ALL"
                ? "bg-card text-foreground shadow-subtle font-sans"
                : "text-muted-foreground hover:text-foreground font-sans"
            }`}
          >
            All
          </button>
        </div>

        {/* Role Filter dropdown */}
        <select
          value={roleFilter}
          onChange={(e: any) => setRoleFilter(e.target.value)}
          className="bg-transparent border border-input rounded-md px-3 py-2 text-xs font-bold outline-hidden focus:border-ring focus:ring-2 focus:ring-ring/20 dark:bg-[#141414] font-sans"
        >
          <option value="ALL">All Roles</option>
          <option value="SUPER_ADMIN">Super Admin Only</option>
          <option value="ADMIN">Admin Only</option>
        </select>
      </div>
    </div>
  );
}
