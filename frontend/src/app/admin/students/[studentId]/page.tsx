'use client';

import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  GraduationCap, 
  Mail, 
  Phone, 
  Calendar, 
  Building2, 
  FileText, 
  UserCheck, 
  Trash2, 
  Download, 
  Clock, 
  Briefcase,
  IdCard,
  AlertCircle,
  History,
  MapPin
} from "lucide-react";
import { useAdminStudent, useSoftDeleteStudent } from "@/hooks/admin/useStudents";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, isValid } from "date-fns";
import { cn } from "@/lib/utils";

const safeFormat = (dateStr: string | undefined | null, formatStr: string) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  if (!isValid(date)) return "N/A";
  return format(date, formatStr);
};

export default function AdminStudentDetailPage() {
  const { studentId } = useParams();
  const router = useRouter();
  const { data: student, isLoading, isError } = useAdminStudent(Number(studentId));
  const { mutate: deleteStudent, isPending: isDeleting } = useSoftDeleteStudent();

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <Skeleton className="h-[200px] w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !student?.data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <AlertCircle className="size-16 text-error opacity-20" />
        <h2 className="text-2xl font-bold">Student record not found</h2>
        <Button onClick={() => router.push("/admin/students")} variant="outline" className="gap-2">
          <ArrowLeft className="size-4" /> Back to Directory
        </Button>
      </div>
    );
  }

  const studentData = student.data;
  const profile = studentData.profile;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Back Link */}
      <button
        onClick={() => router.push("/admin/students")}
        className="group flex items-center gap-2 text-sm font-medium text-mist hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
        Back to Directory
      </button>

      {/* Main Header Card */}
      <Card className="border-none shadow-card bg-card overflow-hidden">
        <CardContent className="p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-heading font-bold tracking-tight text-foreground">{profile.fullName}</h1>
              <div className="flex items-center gap-3 text-mist">
                 <div className="flex items-center gap-1.5 font-medium">
                    <Building2 className="size-4" />
                    <span>{profile.university || "Assam Engineering College"}</span>
                 </div>
                 <div className="size-1 bg-border rounded-full" />
                 <span className="font-mono text-sm">{studentData.email}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-mist/80">
              <div className="flex items-center gap-2">
                <Calendar className="size-4" />
                <span>Joined on {safeFormat(studentData.createdAt, "d MMM yyyy")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="size-4" />
                <span>Updated {safeFormat(studentData.updatedAt, "d MMM yyyy")}</span>
              </div>
              <Badge 
                variant={profile.verificationStatus === "VERIFIED" ? "success" : "warning" as any} 
                className="h-6 font-bold uppercase tracking-wider text-[10px] px-3"
              >
                {profile.verificationStatus.replace("_", " ")}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button className="flex-1 md:flex-none h-12 px-8 bg-gradient-to-r from-[#818cf8] to-[#c084fc] text-white font-bold rounded-xl shadow-button hover:opacity-90 transition-all gap-2">
              <UserCheck className="size-5" /> Verify Profile
            </Button>
            <Button variant="outline" size="icon" className="size-12 rounded-xl border-border/60 text-error hover:bg-error/10 hover:border-error/20 shadow-card transition-all">
              <Trash2 className="size-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Stats Row (CGPA & Backlogs restored) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-card bg-card p-6 flex flex-col justify-between min-h-32 hover:shadow-card transition-shadow duration-300">
          <div className="flex items-center gap-2 text-mist mb-4">
             <GraduationCap className="size-4" />
             <span className="text-[10px] font-bold uppercase tracking-widest">Branch & Course</span>
          </div>
          <div className="flex flex-wrap gap-2">
             <Badge variant="outline" className="bg-muted/30 border-border/40 text-foreground font-bold px-3 py-1">
               {profile.branch}
             </Badge>
             <Badge variant="outline" className="bg-muted/30 border-border/40 text-foreground font-bold px-3 py-1">
               {profile.degree || "B.Tech"}
             </Badge>
          </div>
        </Card>

        <Card className="border-none shadow-card bg-card p-6 flex flex-col justify-between min-h-32 hover:shadow-card transition-shadow duration-300">
          <div className="flex items-center gap-2 text-mist mb-4">
             <History className="size-4" />
             <span className="text-[10px] font-bold uppercase tracking-widest">Academic CGPA</span>
          </div>
          <div className="flex items-baseline gap-1">
             <span className="text-3xl font-heading font-bold text-foreground">{profile.cgpa?.toFixed(2) || "0.00"}</span>
             <span className="text-sm font-bold text-mist">/ 10</span>
          </div>
        </Card>

        <Card className="border-none shadow-card bg-card p-6 flex flex-col justify-between min-h-32 hover:shadow-card transition-shadow duration-300">
          <div className="flex items-center gap-2 text-mist mb-4">
             <AlertCircle className="size-4" />
             <span className="text-[10px] font-bold uppercase tracking-widest">Backlogs</span>
          </div>
          <span className={cn(
            "text-xl font-bold",
            profile.backlog ? "text-error" : "text-success"
          )}>
            {profile.backlog ? "Active Backlogs" : "Clear Records"}
          </span>
        </Card>
      </div>

      {/* Detailed Content Tabs */}
      <Card className="border-none shadow-card bg-card overflow-hidden">
        <Tabs defaultValue="personal" className="w-full">
          <div className="border-b border-border/40 bg-muted/20 px-8 py-2 flex items-center justify-between">
            <TabsList className="bg-transparent border-none p-0 h-14 gap-8">
              <TabsTrigger value="personal" className="h-full bg-transparent border-none data-[state=active]:text-primary data-[state=active]:shadow-none relative p-0 px-2 font-bold text-sm">
                Personal Info
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary opacity-0 data-[state=active]:opacity-100 transition-opacity" />
              </TabsTrigger>
              <TabsTrigger value="academics" className="h-full bg-transparent border-none data-[state=active]:text-primary data-[state=active]:shadow-none relative p-0 px-2 font-bold text-sm">
                Academic Records
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary opacity-0 data-[state=active]:opacity-100 transition-opacity" />
              </TabsTrigger>
              <TabsTrigger value="documents" className="h-full bg-transparent border-none data-[state=active]:text-primary data-[state=active]:shadow-none relative p-0 px-2 font-bold text-sm">
                Documents
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary opacity-0 data-[state=active]:opacity-100 transition-opacity" />
              </TabsTrigger>
              <TabsTrigger value="applications" className="h-full bg-transparent border-none data-[state=active]:text-primary data-[state=active]:shadow-none relative p-0 px-2 font-bold text-sm">
                Applications
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary opacity-0 data-[state=active]:opacity-100 transition-opacity" />
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2 text-[10px] font-bold text-mist uppercase tracking-widest">
              <IdCard className="size-3" />
              {profile.rollNo}
            </div>
          </div>

          <CardContent className="p-10">
            {/* PERSONAL INFO */}
            <TabsContent value="personal" className="mt-0 outline-none animate-in fade-in slide-in-from-top-2 duration-500">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-10">
                  <DetailGroup title="Identity Details">
                    <DetailItem label="Full Name" value={profile.fullName} />
                    <DetailItem label="Roll Number" value={profile.rollNo} />
                    <DetailItem label="Date of Birth" value={safeFormat(profile.dob, "PPP")} />
                  </DetailGroup>
                  <DetailGroup title="Contact Details">
                    <DetailItem label="Email Address" value={studentData.email} />
                    <DetailItem label="Phone Number" value={profile.phoneNumber || "N/A"} />
                    <DetailItem label="University" value={profile.university || "N/A"} />
                  </DetailGroup>
               </div>
            </TabsContent>

            {/* ACADEMIC RECORDS */}
            <TabsContent value="academics" className="mt-0 outline-none animate-in fade-in slide-in-from-top-2 duration-500">
               <div className="space-y-10">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {studentData.semesters?.map((sem) => (
                      <div key={sem.id} className="p-6 rounded-2xl border border-border bg-muted/20 hover:bg-muted/40 shadow-card hover:shadow-card transition-all group">
                        <p className="text-[10px] font-bold text-mist uppercase tracking-widest mb-1">Semester {sem.semester}</p>
                        <p className="text-2xl font-heading font-bold text-foreground group-hover:text-primary transition-colors">{sem.sgpa?.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  {profile.backlogSubjects.length > 0 && (
                    <DetailGroup title="Backlog Subjects">
                      <div className="flex flex-wrap gap-2 mt-4">
                        {profile.backlogSubjects.map(sub => (
                          <span key={sub} className="px-3 py-1 bg-error/10 text-error rounded-lg text-xs font-bold border border-error/5">{sub}</span>
                        ))}
                      </div>
                    </DetailGroup>
                  )}
               </div>
            </TabsContent>

            {/* DOCUMENTS */}
            <TabsContent value="documents" className="mt-0 outline-none animate-in fade-in slide-in-from-top-2 duration-500">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {studentData.documents?.length > 0 ? (
                   studentData.documents.map((doc) => (
                     <div key={doc.id} className="p-6 rounded-2xl border border-border bg-muted/10 hover:bg-muted/20 shadow-card hover:shadow-card transition-all flex items-center gap-5 group">
                        <div className="size-14 rounded-2xl bg-error/5 flex items-center justify-center text-error border border-error/10">
                           <FileText className="size-7" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <h5 className="font-bold text-sm">Semester {doc.semester} Marksheet</h5>
                           <p className="text-[10px] text-mist mt-1">Verified PDF Asset</p>
                        </div>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
                            <Download className="size-4" />
                          </Button>
                        </a>
                     </div>
                   ))
                 ) : (
                   <p className="col-span-full py-10 text-center text-mist italic">No documents uploaded.</p>
                 )}
               </div>
            </TabsContent>

            {/* APPLICATIONS */}
            <TabsContent value="applications" className="mt-0 outline-none animate-in fade-in slide-in-from-top-2 duration-500">
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-border/40">
                        <th className="pb-5 text-[10px] font-bold uppercase tracking-widest text-mist">Job Opportunity</th>
                        <th className="pb-5 text-[10px] font-bold uppercase tracking-widest text-mist">Company</th>
                        <th className="pb-5 text-[10px] font-bold uppercase tracking-widest text-mist">Status</th>
                        <th className="pb-5 text-[10px] font-bold uppercase tracking-widest text-mist text-right">Applied Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {studentData.applications?.map((app) => (
                        <tr key={app.id} className="group">
                          <td className="py-5">
                            <div className="flex items-center gap-3">
                               <div className="size-8 rounded-lg bg-accent flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                  <Briefcase className="size-4" />
                               </div>
                               <span className="text-sm font-bold">{app.job.title}</span>
                            </div>
                          </td>
                          <td className="py-5">
                            <span className="text-sm text-mist">{app.job.company}</span>
                          </td>
                          <td className="py-5">
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-[10px] font-bold uppercase border-transparent shadow-card",
                                app.status === "APPLIED" && "bg-pale text-steel",
                                app.status === "SHORTLISTED" && "bg-warning/10 text-warning",
                                app.status === "SELECTED" && "bg-success/10 text-success",
                                app.status === "REJECTED" && "bg-error/10 text-error",
                              )}
                            >
                              {app.status}
                            </Badge>
                          </td>
                          <td className="py-5 text-sm text-right text-mist font-mono">
                            {safeFormat(app.createdAt, "dd MMM yyyy")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}

function DetailGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-6">
       <h4 className="text-lg font-heading font-bold text-foreground">{title}</h4>
       <div className="space-y-4">
          {children}
       </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5 py-1">
      <span className="text-[10px] font-bold text-mist uppercase tracking-widest">{label}</span>
      <span className="text-sm font-medium text-foreground/90">{value}</span>
    </div>
  );
}
