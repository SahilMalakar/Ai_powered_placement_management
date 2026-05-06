'use client';

import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { ResumeJson } from '@/types/student/resume';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Trash2, PlusCircle } from 'lucide-react';

interface SkillsSectionProps {
  form: UseFormReturn<ResumeJson>;
}

export function SkillsSection({ form }: SkillsSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "skills",
  });

  return (
    <div className="space-y-6">
      {fields.map((field, index) => (
        <Card key={field.id} className="relative border-slate-200 dark:border-muted">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 text-error hover:text-error hover:bg-error/10"
            onClick={() => remove(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <CardHeader className="pb-3">
            <FormField
              control={form.control}
              name={`skills.${index}.category`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Languages, Tools" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name={`skills.${index}.items`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills (comma separated)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="React, TypeScript, Node.js" 
                      value={field.value?.join(', ') || ''}
                      onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()).filter(s => s !== ''))}
                    />
                  </FormControl>
                  <FormDescription>Enter skills separated by commas</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full border-dashed"
        onClick={() => append({ category: '', items: [] })}
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Skill Category
      </Button>
    </div>
  );
}
