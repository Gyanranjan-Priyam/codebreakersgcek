import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FolderGit, Star, GitFork, AlertCircle, ExternalLink, Calendar, Code } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { getGitHubOrgRepos, getPublishedProjects } from "./actions";
import { PublishProjectDialog } from "./_components/publish-project-dialog";
import { UnpublishButton } from "./_components/unpublish-button";

export default async function AllProjectsPage() {
  const result = await getGitHubOrgRepos();
  const publishedResult = await getPublishedProjects();

  // Create a map of published projects for quick lookup
  const publishedMap = new Map();
  if (publishedResult.status === "success") {
    publishedResult.data.forEach((project: any) => {
      publishedMap.set(project.githubRepoId, project);
    });
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <FolderGit className="w-6 h-6 sm:w-8 sm:h-8" />
            All Projects
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            {result.status === "success" 
              ? `Repositories from @${result.githubUsername}`
              : "Browse all project repositories"}
          </p>
        </div>
        {result.status === "success" && (
          <Badge variant="secondary" className="hidden sm:flex">
            {result.data.length} Repositories
          </Badge>
        )}
      </div>

      <Separator />

      {/* Error State */}
      {result.status === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            {result.message}
            {result.message.includes("not linked") && (
              <Link href="/admin/settings" className="ml-2 underline font-medium">
                Go to Settings
              </Link>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Projects Grid */}
      {result.status === "success" && result.data.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderGit className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No repositories found</p>
            <p className="text-sm text-muted-foreground mt-2">
              No repositories found for @{result.githubUsername}
            </p>
          </CardContent>
        </Card>
      )}

      {result.status === "success" && result.data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {result.data.map((repo: any) => {
            const isPublished = publishedMap.has(repo.id);
            const publishedData = publishedMap.get(repo.id);

            return (
              <Card key={repo.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{repo.name}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {repo.fullName}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-1">
                      {repo.private && (
                        <Badge variant="secondary" className="text-xs">
                          Private
                        </Badge>
                      )}
                      {isPublished && (
                        <Badge variant="default" className="text-xs bg-green-600">
                          Published
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
              <CardContent className="space-y-4">
                {/* Description */}
                {repo.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {repo.description}
                  </p>
                )}

                {/* Topics */}
                {repo.topics && repo.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {repo.topics.slice(0, 3).map((topic: string) => (
                      <Badge key={topic} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                    {repo.topics.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{repo.topics.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {repo.language && (
                    <div className="flex items-center gap-1">
                      <Code className="w-4 h-4" />
                      <span>{repo.language}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    <span>{repo.stargazersCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GitFork className="w-4 h-4" />
                    <span>{repo.forksCount}</span>
                  </div>
                </div>

                {/* Updated Date */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>
                    Updated {new Date(repo.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                <Separator />

                {/* Actions */}
                <div className="space-y-2">
                  <Button asChild className="w-full" size="sm" variant="outline">
                    <a href={repo.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on GitHub
                    </a>
                  </Button>
                  
                  {isPublished ? (
                    <UnpublishButton githubRepoId={repo.id} />
                  ) : (
                    <PublishProjectDialog
                      repo={{
                        id: repo.id,
                        name: repo.name,
                        description: repo.description,
                        url: repo.url,
                      }}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        </div>
      )}
    </div>
  );
}