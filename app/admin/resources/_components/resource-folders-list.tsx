"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Folder, MoreVertical, FileText, Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { deleteResourceFolder } from "../actions";
import { toast } from "sonner";
import { EditFolderDialog } from "./edit-folder-dialog";

interface ResourceFolder {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    resources: number;
  };
  createdBy: {
    name: string;
    email: string;
  };
}

interface ResourceFoldersListProps {
  folders: ResourceFolder[];
}

export function ResourceFoldersList({ folders }: ResourceFoldersListProps) {
  const [editingFolder, setEditingFolder] = useState<ResourceFolder | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this folder? All resources inside will be deleted.")) {
      return;
    }

    setDeletingId(id);
    const result = await deleteResourceFolder(id);
    
    if (result.status === "success") {
      toast.success("Folder deleted successfully");
    } else {
      toast.error(result.message);
    }
    setDeletingId(null);
  };

  if (folders.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Folder className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No folders yet</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Create your first folder to organize resources
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {folders.map((folder) => (
          <Card key={folder.id} className="hover:shadow-lg transition-shadow group relative">
            <Link href={`/admin/resources/${folder.id}`} className="absolute inset-0 z-0" />
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{folder.icon || "📁"}</div>
                  <div>
                    <CardTitle className="text-lg">{folder.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {folder._count.resources} resource{folder._count.resources !== 1 ? "s" : ""}
                    </CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative z-10">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/resources/${folder.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Resources
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setEditingFolder(folder)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Folder
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(folder.id)}
                      disabled={deletingId === folder.id}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {folder.description || "No description"}
              </p>
            </CardContent>
            <CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
              <span>By {folder.createdBy.name}</span>
              <Badge variant="outline" className="text-xs">
                Order: {folder.order}
              </Badge>
            </CardFooter>
          </Card>
        ))}
      </div>

      {editingFolder && (
        <EditFolderDialog
          folder={editingFolder}
          open={!!editingFolder}
          onOpenChange={(open) => !open && setEditingFolder(null)}
        />
      )}
    </>
  );
}
