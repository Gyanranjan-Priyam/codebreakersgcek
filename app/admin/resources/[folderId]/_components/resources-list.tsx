"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreVertical, ExternalLink, Edit, Trash2, Download, FileText, Image, Video, File, Plus } from "lucide-react";
import { deleteResource } from "../../actions";
import { toast } from "sonner";
import { EditResourceDialog } from "./edit-resource-dialog";
import { CreateResourceDialog } from "./create-resource-dialog";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  type: string;
  url: string;
  thumbnailUrl: string | null;
  tags: string[];
  order: number;
  downloadable: boolean;
  createdAt: Date;
  uploadedBy: {
    name: string | null;
  };
}

interface ResourcesListProps {
  resources: Resource[];
  folderId: string;
}

function getResourceIcon(type: string) {
  switch (type) {
    case "PDF":
      return <FileText className="h-8 w-8" />;
    case "IMAGE":
      return <Image className="h-8 w-8" />;
    case "VIDEO":
      return <Video className="h-8 w-8" />;
    default:
      return <File className="h-8 w-8" />;
  }
}

function getResourceTypeColor(type: string) {
  switch (type) {
    case "PDF":
      return "bg-red-500/10 text-red-500";
    case "IMAGE":
      return "bg-blue-500/10 text-blue-500";
    case "VIDEO":
      return "bg-purple-500/10 text-purple-500";
    case "DOCUMENT":
      return "bg-green-500/10 text-green-500";
    default:
      return "bg-gray-500/10 text-gray-500";
  }
}

function ResourceCard({ resource }: { resource: Resource }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const result = await deleteResource(resource.id);
    
    if (result.status === "success") {
      toast.success("Resource deleted successfully");
      setDeleteDialogOpen(false);
    } else {
      toast.error(result.message);
    }
    setDeleting(false);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div className="flex gap-3">
            <div className="p-2 rounded-lg bg-muted">
              {getResourceIcon(resource.type)}
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg line-clamp-1">{resource.title}</CardTitle>
              {resource.description && (
                <CardDescription className="line-clamp-2 mt-1">
                  {resource.description}
                </CardDescription>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={getResourceTypeColor(resource.type)}>
                {resource.type}
              </Badge>
              {resource.downloadable && (
                <Badge variant="outline">
                  <Download className="h-3 w-3 mr-1" />
                  Downloadable
                </Badge>
              )}
            </div>
            {resource.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {resource.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              Uploaded by {resource.uploadedBy.name || "Unknown"}
            </div>
          </div>
        </CardContent>
      </Card>

      <EditResourceDialog
        resource={resource}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resource</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{resource.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function EmptyState({ folderId }: { folderId: string }) {
  return (
    <Card className="col-span-full">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No resources yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Add your first resource to this folder
        </p>
        <CreateResourceDialog folderId={folderId} />
      </CardContent>
    </Card>
  );
}

export function ResourcesList({ resources, folderId }: ResourcesListProps) {
  if (resources.length === 0) {
    return <EmptyState folderId={folderId} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {resources.map((resource) => (
        <ResourceCard key={resource.id} resource={resource} />
      ))}
    </div>
  );
}
