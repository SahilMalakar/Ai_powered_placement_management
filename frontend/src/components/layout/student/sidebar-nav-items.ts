import {
  LayoutDashboard,
  Briefcase,
  FileText,
  FileScan,
  User,
  ClipboardList,
  Bell,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const studentNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Announcements",
    href: "/announcements",
    icon: Bell,
  },
  {
    label: "Job Board",
    href: "/jobs",
    icon: Briefcase,
  },
  {
    label: "My Applications",
    href: "/applications",
    icon: ClipboardList,
  },
  {
    label: "Resume Builder",
    href: "/resume",
    icon: FileText,
  },
  {
    label: "Optimize Resume",
    href: "/optimize-resume",
    icon: Sparkles,
  },
  {
    label: "ATS Analyzer",
    href: "/ats",
    icon: FileScan,
  },
  {
    label: "My Profile",
    href: "/profile",
    icon: User,
  },
];
