"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

const profileSchema = z.object({
  fullName: z.string().min(2, "Name too short"),
  phoneNumber: z.string().min(10, "Invalid phone number"),
  branch: z.string(),
  rollNo: z.string(),
  dob: z.string(),
  university: z.string(),
  degree: z.string(),
  graduationYear: z.string(),
  summary: z.string(),
  linkedin: z.string().url().or(z.literal("")),
  github: z.string().url().or(z.literal("")),
  portfolio: z.string().url().or(z.literal("")),
})

export function CoreInfoTab() {
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      branch: "",
      rollNo: "",
      dob: "",
      university: "",
      degree: "",
      graduationYear: "",
      summary: "",
      linkedin: "",
      github: "",
      portfolio: "",
    },
  })

  function onSubmit(values: z.infer<typeof profileSchema>) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-start gap-6 mb-8">
          <Avatar className="h-20 w-20 border-2 border-primary/20">
            <AvatarImage src="" />
            <AvatarFallback className="bg-deep-blue text-white text-xl font-bold">RS</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Full name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" className="bg-background/50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Phone number</FormLabel>
                    <FormControl>
                      <Input placeholder="+91 00000 00000" className="bg-background/50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="branch"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Branch</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="cse">Computer Science</SelectItem>
                    <SelectItem value="ete">Electronics & Telecommunication</SelectItem>
                    <SelectItem value="ee">Electrical Engineering</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rollNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Roll no.</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. CSE/20/001" className="bg-background/50" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Date of birth</FormLabel>
                <FormControl>
                  <Input type="date" className="bg-background/50" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="university"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">University</FormLabel>
                <FormControl>
                  <Input placeholder="University name" className="bg-background/50" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="degree"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Degree</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. B.Tech" className="bg-background/50" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="graduationYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Graduation year</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 2024" className="bg-background/50" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Summary</FormLabel>
              <FormControl>
                <Textarea placeholder="Brief summary about yourself..." className="min-h-[100px] bg-background/50" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-6 border-t border-border">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">Social Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="linkedin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-xs font-semibold">LinkedIn</FormLabel>
                  <FormControl>
                    <Input placeholder="https://linkedin.com/in/..." className="bg-background/50" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="github"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-xs font-semibold">GitHub</FormLabel>
                  <FormControl>
                    <Input placeholder="https://github.com/..." className="bg-background/50" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="portfolio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-xs font-semibold">Portfolio</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." className="bg-background/50" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <Button type="button" variant="secondary" className="px-6 h-10">Cancel</Button>
          <Button type="submit" className="btn-primary px-8 h-10">Save changes</Button>
        </div>
      </form>
    </Form>
  )
}
