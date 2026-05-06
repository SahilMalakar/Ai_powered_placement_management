'use client';

import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { ResumeJson } from '@/types/student/resume';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Trash2, PlusCircle } from 'lucide-react';

interface ExperienceSectionProps {
  form: UseFormReturn<ResumeJson>;
}

export function ExperienceSection({ form }: ExperienceSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "workExperience",
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
                name={`workExperience.${index}.title`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Software Engineer Intern" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`workExperience.${index}.company`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Google" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FormField
                control={form.control}
                name={`workExperience.${index}.dateRange`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date Range</FormLabel>
                    <FormControl>
                      <Input placeholder="Jun 2023 - Aug 2023" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`workExperience.${index}.location`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Remote / City, State" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name={`workExperience.${index}.techStack`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tech Stack (comma separated)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="React, Tailwind, AWS" 
                      value={field.value?.join(', ') || ''}
                      onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`workExperience.${index}.bullets`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bullet Points</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter each bullet point on a new line..." 
                      className="min-h-[100px]"
                      value={field.value?.join('\n') || ''}
                      onChange={(e) => field.onChange(e.target.value.split('\n').filter(s => s.trim() !== ''))}
                    />
                  </FormControl>
                  <FormDescription>One accomplishment per line</FormDescription>
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
        onClick={() => append({ 
          title: '', 
          company: '', 
          location: '', 
          dateRange: '', 
          techStack: [], 
          bullets: [] 
        })}
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Work Experience
      </Button>
    </div>
  );
}
