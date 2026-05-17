import { Metadata } from "next";
import { AnnouncementsDashboard } from "@/components/student/announcements/announcements-dashboard";

export const metadata: Metadata = {
  title: "T&P Announcements | PlacementCube",
  description: "View important placement updates, notifications, and branch-specific broadcasts sent by the Training & Placement Cell.",
};

export default function StudentAnnouncementsPage() {
  return (
    <div className="w-full min-h-screen">
      <AnnouncementsDashboard />
    </div>
  );
}
