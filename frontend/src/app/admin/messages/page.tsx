import { MessageDashboard } from "@/components/admin/messages/message-dashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Announcements | PlacementCube Admin Portal",
  description:
    "Broadcast high-priority notifications, resource links, and documents to targeted student cohorts.",
};

export default function AdminMessagesPage() {
  return <MessageDashboard />;
}
