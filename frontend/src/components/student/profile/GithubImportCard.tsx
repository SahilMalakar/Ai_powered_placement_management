'use client';

import { useState } from "react";
import { useGithubScraperMutation } from "@/hooks/student/useGithubScraper";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GitBranch, Loader2 } from "lucide-react";

const GITHUB_REGEX = /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/?$/;

export function GithubImportCard() {
  const [url, setUrl] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  const mutation = useGithubScraperMutation();
  const isPending = mutation.isPending;

  const isValidUrl = GITHUB_REGEX.test(url);

  const handleImport = () => {
    if (!url || !isValidUrl) return;

    mutation.mutate(url, {
      onSuccess: () => {
        setUrl("");
        setShowSuccess(true);
        const timer = setTimeout(() => {
          setShowSuccess(false);
        }, 5000);
        return () => clearTimeout(timer);
      },
    });
  };

  return (
    <Card className="bg-muted/40 border-border rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-1">
        <GitBranch className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Import from GitHub README</span>
      </div>
      <p className="text-xs text-muted-foreground mb-3 font-body">
        Paste a public GitHub repo URL to automatically create a new project with title, tools, and description extracted from the README.
      </p>

      <div className="flex gap-2 mt-3">
        <Input
          placeholder="https://github.com/username/repo"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setShowSuccess(false);
          }}
          className="flex-1 bg-background border-border"
          disabled={isPending}
        />
        <Button
          onClick={handleImport}
          disabled={!url || !isValidUrl || isPending}
          size="sm"
          className="ml-2 bg-gradient-to-r from-brand-blue to-brand-indigo hover:opacity-90 text-white shadow-button rounded-md font-semibold h-9"
        >
          {isPending ? (
            <>
              <Loader2 className="size-3 mr-1 animate-spin" /> Importing...
            </>
          ) : (
            <>
              <GitBranch className="size-3 mr-1" /> Import
            </>
          )}
        </Button>
      </div>

      {url && !isValidUrl && (
        <p className="text-xs text-[#E24B4A] mt-1 font-body">
          Please enter a valid public GitHub repository URL
        </p>
      )}

      {showSuccess && (
        <p className="text-xs text-[#1D9E75] mt-2 font-body">
          Import queued. A new project will appear in your list shortly.
        </p>
      )}
    </Card>
  );
}
