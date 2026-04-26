import {
  LayoutDashboard,
  Briefcase,
  FileText,
  FileScan,
  User,
  ClipboardList,
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
