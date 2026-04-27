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

import { useProfile } from "@/hooks/student/use-profile"
import { useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"

const profileSchema = z.object({
  fullName: z.string().min(2, "Name too short"),
  phoneNumber: z.string().min(10, "Invalid phone number"),
  branch: z.string(),
  rollNo: z.string(),
  dob: z.string(),
  university: z.string().optional(),
  degree: z.string().optional(),
  graduationYear: z.string().optional(),
  summary: z.string().optional(),
  linkedin: z.string().url().or(z.literal("")).optional(),
  github: z.string().url().or(z.literal("")).optional(),
  portfolio: z.string().url().or(z.literal("")).optional(),
})

interface CoreInfoTabProps {
  onNext: (data: any) => void
  initialData?: any
}

export function CoreInfoTab({ onNext, initialData }: CoreInfoTabProps) {
  const { data: profileData, isLoading } = useProfile()

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

  // Populate form with fetched data or session data
  useEffect(() => {
    const p = profileData?.profile
    const sessionCore = initialData?.core || initialData
    const sessionSocial = initialData?.socialLinks

    form.reset({
      fullName: sessionCore?.fullName || p?.fullName || "",
      phoneNumber: sessionCore?.phoneNumber || p?.phoneNumber || "",
      branch: sessionCore?.branch || p?.branch || "",
      rollNo: sessionCore?.rollNo || p?.rollNo || "",
      dob: sessionCore?.dob 
        ? sessionCore.dob 
        : p?.dob ? new Date(p.dob).toISOString().split('T')[0] : "",
      university: sessionCore?.university || p?.university || "",
      degree: sessionCore?.degree || p?.degree || "",
      graduationYear: sessionCore?.graduationYear?.toString() || p?.graduationYear?.toString() || "",
      summary: sessionCore?.summary || p?.summary || "",
      linkedin: sessionSocial?.find((l: any) => l.platform === "LinkedIn")?.url || p?.socialLinks?.find(l => l.platform === "LinkedIn")?.url || "",
      github: sessionSocial?.find((l: any) => l.platform === "GitHub")?.url || p?.socialLinks?.find(l => l.platform === "GitHub")?.url || "",
      portfolio: sessionSocial?.find((l: any) => l.platform === "Portfolio")?.url || p?.socialLinks?.find(l => l.platform === "Portfolio")?.url || "",
    })
  }, [profileData, initialData, form])

  function onSubmit(values: z.infer<typeof profileSchema>) {
    const socialLinks = [
      { platform: "LinkedIn", url: values.linkedin || "" },
      { platform: "GitHub", url: values.github || "" },
      { platform: "Portfolio", url: values.portfolio || "" },
    ].filter(link => link.url !== "")

    const coreData = {
      fullName: values.fullName,
      phoneNumber: values.phoneNumber,
      branch: values.branch as any,
      rollNo: values.rollNo,
      dob: values.dob,
      university: values.university,
      degree: values.degree,
      graduationYear: values.graduationYear ? parseInt(values.graduationYear) : undefined,
      summary: values.summary,
    }

    onNext({ core: coreData, socialLinks })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-6 mb-8">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex justify-end gap-3 pt-6">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-start gap-6 mb-8">
          <Avatar className="h-20 w-20 border-2 border-primary/20">
            <AvatarImage src="" />
            <AvatarFallback className="bg-deep-blue text-white text-xl font-bold">
              {form.getValues("fullName")?.charAt(0) || "S"}
            </AvatarFallback>
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
                    <SelectItem value="CSE">Computer Science (CSE)</SelectItem>
                    <SelectItem value="ETE">Electronics & Telecommunication (ETE)</SelectItem>
                    <SelectItem value="EE">Electrical Engineering (EE)</SelectItem>
                    <SelectItem value="ME">Mechanical Engineering (ME)</SelectItem>
                    <SelectItem value="IE">Instrumentation Engineering (IE)</SelectItem>
                    <SelectItem value="CE">Civil Engineering (CE)</SelectItem>
                    <SelectItem value="CHE">Chemical Engineering (CHE)</SelectItem>
                    <SelectItem value="IPE">Industrial & Production Engineering (IPE)</SelectItem>
                    <SelectItem value="MCA">Master of Computer Applications (MCA)</SelectItem>
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
          <Button type="submit" className="btn-primary px-10 h-11 rounded-xl shadow-button flex items-center gap-2">
            Next step
            <span className="text-lg">→</span>
          </Button>
        </div>
      </form>
    </Form>
  )
}