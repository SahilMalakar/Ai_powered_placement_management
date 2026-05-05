"use client";

import { ApplicationList } from "@/components/applications/application-list";

export default function ApplicationsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-navy dark:text-foreground">
          My Applications
        </h1>
        <p className="text-steel dark:text-muted-foreground max-w-2xl">
          Track the status of your job applications. Monitor shortlists and selections.
        </p>
      </div>

      <ApplicationList />
    </div>
  );
}
