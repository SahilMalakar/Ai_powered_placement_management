import { ResumeList as OriginalResumeList } from "@/components/student/resume/resume-list";
import { ResumeList } from "@/components/student/resume/ResumeList";
import { Separator } from "@/components/ui/separator";

export default function ResumePage() {
  return (
    <div className="container mx-auto pt-12 pb-20 px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Section 1 — Original generated resumes (includes header + generate button) */}
      <OriginalResumeList />
    </div>
  );
}
