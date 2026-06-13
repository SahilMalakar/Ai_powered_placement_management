'use client';

import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, AlertCircle } from "lucide-react";

interface PreviewRecord {
  id: number;
  fullName: string;
  rollNo: string;
  email: string;
  branch: string;
  cgpa: number | string;
  status: string;
}

interface ExportPreviewTableProps {
  records: PreviewRecord[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  isLoading: boolean;
  totalCount: number;
  type: 'students' | 'applications';
}

const STATUS_BADGE_CLASSES: Record<string, string> = {
  APPLIED: "bg-[#EF9F27]/10 border-[#EF9F27]/20 text-[#EF9F27]",
  SHORTLISTED: "bg-[#EF9F27]/10 border-[#EF9F27]/20 text-[#EF9F27]",
  PROCESSING: "bg-[#EF9F27]/10 border-[#EF9F27]/20 text-[#EF9F27]",
  SELECTED: "bg-[#1D9E75]/10 border-[#1D9E75]/20 text-[#1D9E75]",
  VERIFIED: "bg-[#1D9E75]/10 border-[#1D9E75]/20 text-[#1D9E75]",
  NOT_VERIFIED: "bg-secondary text-muted-foreground border-border",
  FAILED: "bg-[#E24B4A]/10 border-[#E24B4A]/20 text-[#E24B4A]",
  REJECTED: "bg-[#E24B4A]/10 border-[#E24B4A]/20 text-[#E24B4A]",
};

export default function ExportPreviewTable({
  records,
  selectedIds,
  onChange,
  isLoading,
  totalCount,
  type,
}: ExportPreviewTableProps) {
  const visibleIds = records.map((r) => r.id);
  const selectedVisible = visibleIds.filter((id) => selectedIds.includes(id));
  const isAllVisibleSelected = visibleIds.length > 0 && selectedVisible.length === visibleIds.length;

  const handleToggleAll = () => {
    if (isAllVisibleSelected) {
      // Remove all visible IDs from selectedIds
      onChange(selectedIds.filter((id) => !visibleIds.includes(id)));
    } else {
      // Add all visible IDs that are not already selected
      const toAdd = visibleIds.filter((id) => !selectedIds.includes(id));
      onChange([...selectedIds, ...toAdd]);
    }
  };

  const handleToggleRecord = (id: number, checked: boolean) => {
    if (checked) {
      onChange([...selectedIds, id]);
    } else {
      onChange(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-card border border-border rounded-xl space-y-3">
        <Loader2 className="size-6 text-primary animate-spin" />
        <span className="text-sm text-muted-foreground font-heading">Fetching record preview...</span>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-card border border-border rounded-xl space-y-2 text-center">
        <AlertCircle className="size-8 text-[#EF9F27]" />
        <h4 className="text-sm font-heading font-bold text-foreground">No matching records found</h4>
        <p className="text-xs text-muted-foreground max-w-md">
          Adjust the filters above. Current queries do not return any data for preview.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-heading font-bold text-foreground">
            Data Preview & Record Selection
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Showing first {records.length} matching rows. Total estimated rows: {totalCount}.
          </p>
        </div>
        {selectedIds.length > 0 && (
          <Badge className="bg-primary/10 border-primary/20 text-primary font-mono text-xs">
            {selectedIds.length} Record{selectedIds.length > 1 ? 's' : ''} Selected (Overrides filters)
          </Badge>
        )}
      </div>

      <div className="border border-border/80 rounded-xl overflow-hidden shadow-subtle bg-card">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="border-b border-border/60 hover:bg-transparent">
              <TableHead className="w-[50px] text-center">
                <Checkbox
                  checked={isAllVisibleSelected}
                  onCheckedChange={handleToggleAll}
                />
              </TableHead>
              <TableHead className="font-heading text-xs text-muted-foreground">ID</TableHead>
              <TableHead className="font-heading text-xs text-muted-foreground">Full Name</TableHead>
              <TableHead className="font-heading text-xs text-muted-foreground">Roll Number</TableHead>
              <TableHead className="font-heading text-xs text-muted-foreground">Email</TableHead>
              <TableHead className="font-heading text-xs text-muted-foreground">Branch</TableHead>
              <TableHead className="font-heading text-xs text-muted-foreground text-center">CGPA</TableHead>
              <TableHead className="font-heading text-xs text-muted-foreground text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => {
              const isChecked = selectedIds.includes(record.id);
              const badgeClass = STATUS_BADGE_CLASSES[record.status] || "bg-secondary text-foreground";

              return (
                <TableRow
                  key={record.id}
                  className={`border-b border-border/40 hover:bg-muted/20 transition-colors ${
                    isChecked ? "bg-primary/5" : ""
                  }`}
                  onClick={() => handleToggleRecord(record.id, !isChecked)}
                >
                  <TableCell className="text-center" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(checked) => handleToggleRecord(record.id, checked === true)}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{record.id}</TableCell>
                  <TableCell className="font-medium text-xs text-foreground">{record.fullName}</TableCell>
                  <TableCell className="font-mono text-xs text-foreground">{record.rollNo}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{record.email}</TableCell>
                  <TableCell className="font-heading text-xs font-semibold text-foreground">{record.branch}</TableCell>
                  <TableCell className="text-xs font-medium text-center text-foreground">{record.cgpa}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={`text-[10px] font-semibold tracking-wide py-0.5 px-2 uppercase border ${badgeClass}`}>
                      {record.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
