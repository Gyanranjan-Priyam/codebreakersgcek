import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getResourceFolders, getResourcesByFolder } from "../actions";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { ResourcesList } from "./_components/resources-list";
import { CreateResourceDialog } from "./_components/create-resource-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface FolderPageProps {
  params: Promise<{
    folderId: string;
  }>;
}

async function FolderContent({ folderId }: { folderId: string }) {
  const folders = await getResourceFolders();
  const folder = folders.data?.find((f) => f.id === folderId);

  if (!folder) {
    notFound();
  }

  const resources = await getResourcesByFolder(folderId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/resources">
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
        <CreateResourceDialog folderId={folderId} />
      </div>

      {/* Resources List */}
      <ResourcesList resources={resources.data || []} folderId={folderId} />
    </div>
  );
}

export default async function FolderPage({ params }: FolderPageProps) {
  const { folderId } = await params;

  return (
    <div className="container py-8">
      <Suspense fallback={<FolderPageSkeleton />}>
        <FolderContent folderId={folderId} />
      </Suspense>
    </div>
  );
}

function FolderPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: FolderPageProps) {
  const { folderId } = await params;
  const folders = await getResourceFolders();
  const folder = folders.data?.find((f) => f.id === folderId);

  return {
    title: folder ? `${folder.name} - Resources` : "Folder - Resources",
    description: folder?.description || "Manage resources in this folder",
  };
}
