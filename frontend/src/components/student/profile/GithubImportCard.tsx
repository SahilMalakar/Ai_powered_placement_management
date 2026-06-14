'use client';

import { useState, useEffect } from "react";
import { useProjects } from "@/hooks/student/use-projects";
import { useGithubScraperMutation } from "@/hooks/student/useGithubScraper";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GitBranch, Loader2 } from "lucide-react";

const GITHUB_REGEX = /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/?$/;

export function GithubImportCard() {
  const { data: projects, isLoading: isLoadingProjects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [githubUrl, setGithubUrl] = useState<string>("");
  const [urlError, setUrlError] = useState<string>("");
  const [showSuccessNote, setShowSuccessNote] = useState<boolean>(false);

  const parsedProjectId = selectedProjectId ? parseInt(selectedProjectId, 10) : null;
  const scraperMutation = useGithubScraperMutation(parsedProjectId || 0);

  // Handle URL change & live validation
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGithubUrl(value);

    if (value && !GITHUB_REGEX.test(value)) {
      setUrlError("Please enter a valid GitHub repository URL");
    } else {
      setUrlError("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl || !parsedProjectId || urlError) return;

    scraperMutation.mutate(githubUrl, {
      onSuccess: () => {
        setGithubUrl("");
        setSelectedProjectId("");
        setShowSuccessNote(true);
        const timer = setTimeout(() => {
          setShowSuccessNote(false);
        }, 5000);
        return () => clearTimeout(timer);
      },
    });
  };

  const projectList = projects || [];
  const hasProjects = projectList.length > 0;

  return (
    <Card className="bg-muted/40 border-border rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-1">
        <GitBranch className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Import from GitHub README</span>
      </div>
      <p className="text-xs text-muted-foreground mb-3 font-body">
        Paste a public GitHub repo URL to auto-generate project description.
      </p>

      {isLoadingProjects ? (
        <div className="flex items-center gap-2 py-2">
          <Loader2 className="animate-spin size-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Loading your projects...</span>
        </div>
      ) : !hasProjects ? (
        <p className="text-xs text-muted-foreground font-medium italic">
          Add a project first, then import its description from GitHub.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Select project */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
              Select project to update
            </label>
            <Select onValueChange={(v) => setSelectedProjectId(v ?? "")} value={selectedProjectId}>
              <SelectTrigger className="w-full h-9 bg-background/50 border-input rounded-lg px-3 shadow-sm hover:border-ring/40 transition-all text-sm">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent
                className="bg-card border-border shadow-modal rounded-xl p-1 z-50"
                alignItemWithTrigger={false}
                side="bottom"
                sideOffset={6}
              >
                {projectList.map((project) => (
                  <SelectItem
                    key={project.id}
                    value={project.id!.toString()}
                    className="rounded-md py-2 px-3 cursor-pointer hover:bg-accent/60 transition-colors text-sm font-body"
                  >
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* URL Input & Button */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Input
                placeholder="https://github.com/username/repo"
                value={githubUrl}
                onChange={handleUrlChange}
                disabled={scraperMutation.isPending}
                className="h-9 bg-background border-border"
              />
            </div>
            <Button
              type="submit"
              disabled={!githubUrl || !selectedProjectId || !!urlError || scraperMutation.isPending}
              className="bg-gradient-to-r from-brand-blue to-brand-indigo hover:opacity-90 text-white shadow-button rounded-md font-semibold h-9"
            >
              {scraperMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <GitBranch className="mr-2 h-4 w-4" />
                  Import
                </>
              )}
            </Button>
          </div>

          {/* Validation Feedback */}
          {urlError && (
            <p className="text-xs text-[#E24B4A] mt-1 font-body">
              {urlError}
            </p>
          )}

          {/* Success Note */}
          {showSuccessNote && (
            <p className="text-xs text-[#1D9E75] mt-2 font-body">
              Import queued. Project description will update in a moment.
            </p>
          )}
        </form>
      )}
    </Card>
  );
}
