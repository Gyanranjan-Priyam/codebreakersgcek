"use client";

import { useEffect, useState } from "react";
import { GitHubCalendar } from "react-github-calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, GitBranch, Github, AlertCircle } from "lucide-react";
import { useTheme } from "next-themes";

interface GitHubContributionCalendarProps {
  username: string;
  className?: string;
  showCardWrapper?: boolean;
}

export default function GitHubContributionCalendar({
  username,
  className = "",
  showCardWrapper = true,
}: GitHubContributionCalendarProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setMounted(true);
    setHasError(false);
  }, [username]);

  const cleanUsername = username.trim().replace(/^@/, "");

  if (!cleanUsername) return null;

  const content = (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
            <Github className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold flex items-center gap-1.5">
              GitHub Contributions
              <span className="text-xs text-muted-foreground font-mono">
                @{cleanUsername}
              </span>
            </h4>
            <p className="text-xs text-muted-foreground">
              Public activity & commit history
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1.5 self-start sm:self-auto"
          asChild
        >
          <a
            href={`https://github.com/${cleanUsername}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>View Profile</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </Button>
      </div>

      <div className="overflow-x-auto pb-2 pt-1 no-scrollbar flex justify-center items-center min-h-[140px]">
        {!mounted ? (
          <div className="w-full space-y-2 py-4">
            <Skeleton className="h-28 w-full rounded-lg" />
          </div>
        ) : hasError ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-6">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <span>Could not load GitHub contributions for @{cleanUsername}. Profile may be private or username invalid.</span>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <GitHubCalendar
              username={cleanUsername}
              blockSize={12}
              blockMargin={4}
              fontSize={12}
              colorScheme={resolvedTheme === "dark" ? "dark" : "light"}
              throwOnError={false}
              errorMessage={`Could not load GitHub contributions for @${cleanUsername}`}
            />
          </div>
        )}
      </div>
    </div>
  );

  if (!showCardWrapper) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        {content}
      </CardContent>
    </Card>
  );
}
