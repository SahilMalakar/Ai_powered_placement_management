'use client';

import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { ResumeJson } from '@/types/student/resume';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { Trash2, PlusCircle } from 'lucide-react';

interface EducationSectionProps {
  form: UseFormReturn<ResumeJson>;
}

export function EducationSection({ form }: EducationSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "education",
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
                name={`education.${index}.institution`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution</FormLabel>
                    <FormControl>
                      <Input placeholder="University Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`education.${index}.degree`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Degree</FormLabel>
                    <FormControl>
                      <Input placeholder="B.Tech in Computer Science" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FormField
                control={form.control}
                name={`education.${index}.dateRange`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date Range</FormLabel>
                    <FormControl>
                      <Input placeholder="2020 - 2024" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`education.${index}.cgpa`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CGPA / Percentage</FormLabel>
                    <FormControl>
                      <Input placeholder="8.5 / 10" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardHeader>
        </Card>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full border-dashed"
        onClick={() => append({ institution: '', degree: '', dateRange: '', cgpa: '' })}
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Education
      </Button>
    </div>
  );
}
