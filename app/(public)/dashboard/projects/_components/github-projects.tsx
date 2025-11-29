"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  GitFork, 
  Eye, 
  ExternalLink, 
  Calendar, 
  Code2, 
  Github,
  AlertCircle,
  Loader2
} from "lucide-react";
import { getUserGitHubRepos } from "../actions";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  topics: string[];
  visibility: string;
}

export function GitHubProjects() {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [allRepos, setAllRepos] = useState<GitHubRepo[]>([]);
  const [user, setUser] = useState<{ name: string; githubUsername: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForked, setShowForked] = useState(false);

  useEffect(() => {
    async function loadRepos() {
      try {
        const result = await getUserGitHubRepos();
        
        if (result.status === "error") {
          setError(result.message);
        } else {
          setUser(result.data.user);
          setAllRepos(result.data.allRepos || []);
          setRepos(result.data.repos);
        }
      } catch (err) {
        setError("Failed to load repositories: " + (err instanceof Error ? err.message : String(err)));
      } finally {
        setLoading(false);
      }
    }

    loadRepos();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "short", 
      day: "numeric" 
    });
  };

  const getLanguageColor = (language: string | null) => {
    const colors: Record<string, string> = {
      JavaScript: "bg-yellow-500",
      TypeScript: "bg-blue-500",
      Python: "bg-blue-600",
      Java: "bg-red-500",
      "C++": "bg-pink-500",
      C: "bg-gray-600",
      Go: "bg-cyan-500",
      Rust: "bg-orange-600",
      Ruby: "bg-red-600",
      PHP: "bg-purple-500",
      Swift: "bg-orange-500",
      Kotlin: "bg-purple-600",
      Dart: "bg-blue-400",
      HTML: "bg-orange-400",
      CSS: "bg-blue-300",
    };
    return colors[language || ""] || "bg-gray-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your GitHub repositories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>{error}</p>
          {error.includes("GitHub username") && (
            <Button asChild variant="outline" size="sm" className="mt-2">
              <Link href="/dashboard/settings">Go to Settings</Link>
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (repos.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
              <Github className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">No Public Repositories Found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                No public repositories found for @{user?.githubUsername}.
              </p>
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm text-left max-w-md mx-auto space-y-3">
                <div>
                  <p className="font-semibold mb-2">⏱️ Just made a repo public?</p>
                  <p className="text-muted-foreground">
                    GitHub's API can take <strong>5-30 minutes</strong> to update after changing repository visibility. Try the refresh button in a few minutes.
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-2">📌 To make a repository public:</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Go to your repository on GitHub</li>
                    <li>Click <strong>Settings</strong> tab</li>
                    <li>Scroll to <strong>Danger Zone</strong></li>
                    <li>Click <strong>Change visibility</strong></li>
                    <li>Select <strong>Make public</strong></li>
                  </ol>
                </div>
              </div>
            </div>
            <Button asChild variant="outline">
              <a 
                href={`https://github.com/${user?.githubUsername}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="gap-2"
              >
                <Github className="h-4 w-4" />
                View GitHub Profile
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with GitHub Profile Link */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            Showing {showForked ? allRepos.length : repos.length} repositor{(showForked ? allRepos.length : repos.length) === 1 ? "y" : "ies"} from
          </p>
          <Button asChild variant="link" className="p-0 h-auto font-semibold text-base">
            <a 
              href={`https://github.com/${user?.githubUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="gap-2"
            >
              <Github className="h-4 w-4" />
              @{user?.githubUsername}
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForked(!showForked)}
          >
            {showForked ? "Hide" : "Show"} Forked ({allRepos.length - repos.length})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setLoading(true);
              setError(null);
              window.location.reload();
            }}
          >
            <Loader2 className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Repository Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(showForked ? allRepos : repos).map((repo) => (
          <Card key={repo.id} className="flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base truncate">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary flex items-center gap-2"
                    >
                      <Code2 className="h-4 w-4 shrink-0" />
                      <span className="truncate">{repo.name}</span>
                    </a>
                  </CardTitle>
                </div>
                {repo.visibility === "private" && (
                  <Badge variant="secondary" className="text-xs shrink-0">
                    Private
                  </Badge>
                )}
              </div>
              <CardDescription className="line-clamp-2 min-h-10">
                {repo.description || "No description provided"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 mt-auto space-y-3">
              {/* Topics */}
              {repo.topics && repo.topics.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {repo.topics.slice(0, 3).map((topic) => (
                    <Badge 
                      key={topic} 
                      variant="outline" 
                      className="text-xs px-2 py-0"
                    >
                      {topic}
                    </Badge>
                  ))}
                  {repo.topics.length > 3 && (
                    <Badge variant="outline" className="text-xs px-2 py-0">
                      +{repo.topics.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {repo.language && (
                  <div className="flex items-center gap-1.5">
                    <div className={`w-3 h-3 rounded-full ${getLanguageColor(repo.language)}`} />
                    <span className="text-xs">{repo.language}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5" />
                  <span className="text-xs">{repo.stargazers_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <GitFork className="h-3.5 w-3.5" />
                  <span className="text-xs">{repo.forks_count}</span>
                </div>
              </div>

              {/* Updated Date */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Updated {formatDate(repo.updated_at)}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button asChild size="sm" className="flex-1" variant="outline">
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gap-2"
                  >
                    <Github className="h-3.5 w-3.5" />
                    View Code
                  </a>
                </Button>
                {repo.homepage && (
                  <Button asChild size="sm" className="flex-1">
                    <a
                      href={repo.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gap-2"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Live Demo
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
