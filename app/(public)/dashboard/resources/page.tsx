import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getResourceFolders } from "@/app/admin/resources/actions";
import { FolderOpen } from "lucide-react";
import Link from "next/link";

async function ResourceFoldersContent() {
  const result = await getResourceFolders();
  const folders = result.data?.filter((f) => f.isActive) || [];

  if (folders.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No resources available</h3>
          <p className="text-sm text-muted-foreground">
            Check back later for learning resources
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {folders.map((folder) => (
        <Link key={folder.id} href={`/dashboard/resources/${folder.id}`}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-start gap-3">
                <span className="text-4xl">{folder.icon}</span>
                <div className="flex-1">
                  <CardTitle className="text-xl">{folder.name}</CardTitle>
                  {folder.description && (
                    <CardDescription className="mt-2 line-clamp-2">
                      {folder.description}
                    </CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{folder._count.resources} resources</span>
                <span>View →</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export default function ResourcesPage() {
  return (
    <div className="container py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Learning Resources</h1>
        <p className="text-muted-foreground mt-2">
          Explore tutorials, documents, and videos to enhance your skills
        </p>
      </div>

      <Suspense fallback={<ResourcesPageSkeleton />}>
        <ResourceFoldersContent />
      </Suspense>
    </div>
  );
}

function ResourcesPageSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export const metadata = {
  title: "Resources - Learning Materials",
  description: "Browse and access learning resources",
};
