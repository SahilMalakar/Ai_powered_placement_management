'use client';

import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Grid, CheckSquare, Square } from "lucide-react";

interface Field {
  readonly key: string;
  readonly label: string;
}

interface ExportFieldSelectorProps {
  fields: readonly Field[];
  selectedFields: string[];
  onChange: (fields: string[]) => void;
}

export default function ExportFieldSelector({
  fields,
  selectedFields,
  onChange,
}: ExportFieldSelectorProps) {
  const allKeys = fields.map((f) => f.key);
  const isAllSelected = allKeys.length > 0 && selectedFields.length === allKeys.length;

  const handleToggleAll = () => {
    if (isAllSelected) {
      onChange([]);
    } else {
      onChange([...allKeys]);
    }
  };

  const handleToggleField = (key: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedFields, key]);
    } else {
      onChange(selectedFields.filter((f) => f !== key));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <h3 className="text-sm font-heading font-bold text-foreground flex items-center gap-2">
          <Grid className="size-4 text-primary" /> Whitelisted Columns Selection
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs hover:bg-muted text-muted-foreground hover:text-foreground font-heading flex items-center gap-1.5 cursor-pointer"
          onClick={handleToggleAll}
        >
          {isAllSelected ? (
            <>
              <Square className="size-3.5" /> Clear All Columns
            </>
          ) : (
            <>
              <CheckSquare className="size-3.5" /> Select All Columns
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {fields.map((field) => {
          const isChecked = selectedFields.includes(field.key);
          return (
            <div
              key={field.key}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 select-none cursor-pointer hover:shadow-subtle ${
                isChecked
                  ? "bg-primary/5 border-primary/40 text-foreground"
                  : "bg-card border-border hover:border-border/80 text-muted-foreground"
              }`}
              onClick={() => handleToggleField(field.key, !isChecked)}
            >
              <Checkbox
                id={`field-${field.key}`}
                checked={isChecked}
                onCheckedChange={(checked) => handleToggleField(field.key, checked === true)}
                onClick={(e) => e.stopPropagation()}
              />
              <Label
                htmlFor={`field-${field.key}`}
                className="text-xs font-medium cursor-pointer flex-1"
                onClick={(e) => e.stopPropagation()}
              >
                {field.label}
              </Label>
            </div>
          );
        })}
      </div>
      {selectedFields.length === 0 && (
        <p className="text-[11px] text-[#EF9F27] bg-[#EF9F27]/10 border border-[#EF9F27]/20 p-2 rounded-md">
          ⚠️ Leaving all columns unselected will fallback to exporting all available columns.
        </p>
      )}
    </div>
  );
}
