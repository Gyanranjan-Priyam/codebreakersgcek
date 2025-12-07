import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderPlus, Loader2 } from "lucide-react";
import { getResourceFolders } from "./actions";
import { ResourceFoldersList } from "./_components/resource-folders-list";
import { CreateFolderDialog } from "./_components/create-folder-dialog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resources",
  description: "Manage learning resources and materials",
};

function FoldersLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

async function ResourceFoldersSection() {
  const result = await getResourceFolders();

  if (result.status === "error" || !result.data) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">{result.message || "Failed to load folders"}</p>
        </CardContent>
      </Card>
    );
  }

  return <ResourceFoldersList folders={result.data} />;
}

export default function AdminResourcesPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
          <p className="text-muted-foreground mt-2">
            Manage learning materials, documents, and media files
          </p>
        </div>
        <CreateFolderDialog>
          <Button>
            <FolderPlus className="mr-2 h-4 w-4" />
            Create Folder
          </Button>
        </CreateFolderDialog>
      </div>

      {/* Overview Stats */}
      <Suspense fallback={<FoldersLoading />}>
        <ResourceFoldersSection />
      </Suspense>
    </div>
  );
}
