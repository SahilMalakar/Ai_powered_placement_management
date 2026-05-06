import { 
  Users, 
  Search, 
  Filter,
  UserCheck,
  UserX,
  GraduationCap,
  MapPin,
  ExternalLink
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function AdminStudentsPage() {
  const students = [
    {
      id: "1",
      name: "Sahil Malakar",
      branch: "Computer Science",
      batch: "2025",
      cgpa: "9.2",
      status: "VERIFIED",
    },
    {
      id: "2",
      name: "Ananya Sharma",
      branch: "Information Technology",
      batch: "2025",
      cgpa: "8.5",
      status: "PENDING",
    },
    {
      id: "3",
      name: "Rahul Verma",
      branch: "Electronics",
      batch: "2024",
      cgpa: "7.8",
      status: "FAILED",
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Student Directory</h1>
          <p className="text-muted-foreground mt-1">Manage and verify student profiles and academic records.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Search by name, roll number, or branch..." className="pl-10 h-11 border-none shadow-subtle bg-card" />
        </div>
        <Button variant="secondary" className="h-11 shadow-subtle">
          <Filter className="size-4 mr-2" /> Filters
        </Button>
      </div>

      <div className="bg-card rounded-xl shadow-heavy overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-sidebar-border">
                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">Student</th>
                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">Branch & Batch</th>
                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">Academic Info</th>
                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">Verification</th>
                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sidebar-border">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10 border-2 border-primary/10">
                        <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                          {student.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-foreground">{student.name}</p>
                        <p className="text-xs text-muted-foreground">ID: #{student.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium flex items-center gap-1.5 text-foreground">
                        <GraduationCap className="size-3.5 text-primary" /> {student.branch}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 pl-5">
                         Batch {student.batch}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <p className="font-semibold text-foreground">{student.cgpa} CGPA</p>
                    <p className="text-xs text-muted-foreground">0 active backlogs</p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={
                      student.status === "VERIFIED" ? "success" : 
                      student.status === "PENDING" ? "warning" : "error" as any
                    } className="px-2.5 py-0.5">
                      {student.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/5 gap-1.5 font-bold">
                      View Profile <ExternalLink className="size-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
