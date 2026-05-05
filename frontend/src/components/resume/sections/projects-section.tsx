'use client';

import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { ResumeJson } from '@/types/resume';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Trash2, PlusCircle } from 'lucide-react';

interface ProjectsSectionProps {
  form: UseFormReturn<ResumeJson>;
}

export function ProjectsSection({ form }: ProjectsSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "projects",
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
            <FormField
              control={form.control}
              name={`projects.${index}.title`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Title</FormLabel>
                  <FormControl>
                    <Input placeholder="E-commerce Dashboard" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`projects.${index}.githubUrl`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://github.com/..." {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`projects.${index}.liveUrl`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Live Demo URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://project.vercel.app" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name={`projects.${index}.techStack`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tech Stack (comma separated)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="React, Firebase, Stripe" 
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
              name={`projects.${index}.bullets`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bullet Points</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Key features and contributions..." 
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
        onClick={() => append({ 
          title: '', 
          techStack: [], 
          githubUrl: '', 
          liveUrl: '', 
          dateRange: '', 
          bullets: [] 
        })}
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Project
      </Button>
    </div>
  );
}
