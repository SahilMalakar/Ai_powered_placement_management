'use client';

import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { ResumeJson } from '@/types/student/resume';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Trash2, PlusCircle } from 'lucide-react';

interface AdditionalDetailsSectionProps {
  form: UseFormReturn<ResumeJson>;
}

export function AdditionalDetailsSection({ form }: AdditionalDetailsSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "additionalDetails",
  });

  return (
    <div className="space-y-6">
      {fields.map((field, index) => (
        <Card key={field.id} className="relative">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 text-error hover:text-error hover:bg-error/10"
            onClick={() => remove(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <CardHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`additionalDetails.${index}.title`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Certifications / Awards" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`additionalDetails.${index}.date`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="2023" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name={`additionalDetails.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Details (one per line)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter each detail on a new line..." 
                      className="min-h-[100px]"
                      value={field.value?.join('\n') || ''}
                      onChange={(e) => field.onChange(e.target.value.split('\n').filter(s => s.trim() !== ''))}
                    />
                  </FormControl>
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
        onClick={() => append({ title: '', description: [], date: '' })}
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Additional Detail
      </Button>
    </div>
  );
}
