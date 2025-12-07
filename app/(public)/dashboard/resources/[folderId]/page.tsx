import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getResourceFolders, getResourcesByFolder } from "@/app/admin/resources/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, FileText, Video } from "lucide-react";
import Link from "next/link";
import { ResourceCard } from "./_components/resource-card";

// Force dynamic rendering to avoid caching issues
export const dynamic = 'force-dynamic';

interface FolderPageProps {
  params: Promise<{
    folderId: string;
  }>;
}

async function FolderContent({ folderId }: { folderId: string }) {
  const foldersResult = await getResourceFolders();
  const folder = foldersResult.data?.find((f) => f.id === folderId && f.isActive);

  if (!folder) {
    notFound();
  }

  const resourcesResult = await getResourcesByFolder(folderId);
  const resources = resourcesResult.data?.filter((r) => r.isActive) || [];

  // Separate resources into documents and videos
  const documents = resources.filter((r) => r.type !== "VIDEO");
  const videos = resources.filter((r) => r.type === "VIDEO");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/resources">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xl">{folder.icon}</span>
            <h1 className="text-3xl font-bold">{folder.name}</h1>
          </div>
          {folder.description && (
            <p className="text-muted-foreground mt-1">{folder.description}</p>
          )}
        </div>
      </div>

      {/* Empty state */}
      {resources.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No resources available</h3>
            <p className="text-sm text-muted-foreground">
              Resources will be added to this folder soon
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Documents Section (PDF, Image, Documents) */}
          {documents.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <h2 className="text-2xl font-semibold">Documents & Files</h2>
                <Badge variant="secondary">{documents.length}</Badge>
              </div>
              <div className="space-y-3">
                {documents.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            </div>
          )}

          {/* Videos Section */}
          {videos.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                <h2 className="text-2xl font-semibold">Videos</h2>
                <Badge variant="secondary">{videos.length}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {videos.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default async function FolderPage({ params }: FolderPageProps) {
  const { folderId } = await params;

  return (
    <div className="container py-8 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<FolderPageSkeleton />}>
        <FolderContent folderId={folderId} />
      </Suspense>
    </div>
  );
}

function FolderPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="p-0">
              <Skeleton className="aspect-video w-full" />
              <div className="p-6 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: FolderPageProps) {
  const { folderId } = await params;
  const result = await getResourceFolders();
  const folder = result.data?.find((f) => f.id === folderId);

  return {
    title: folder ? `${folder.name} - Resources` : "Resources",
    description: folder?.description || "Browse learning resources",
  };
}
