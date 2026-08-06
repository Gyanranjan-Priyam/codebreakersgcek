"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { MoreHorizontal, Copy, Eye, Edit, ToggleLeft, ToggleRight, Trash2, Inbox } from "lucide-react";
import { deleteForm, toggleFormPublish } from "../actions";

interface FormRow {
  id: string;
  formId: string;
  title: string;
  description: string | null;
  isPublished: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    responses: number;
  };
}

interface FormsListProps {
  forms: FormRow[];
}

export default function FormsList({ forms }: FormsListProps) {
  const router = useRouter();
  const [selectedForm, setSelectedForm] = useState<FormRow | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCopy = async (formId: string) => {
    await navigator.clipboard.writeText(`${window.location.origin}/forms/${formId}`);
    toast.success("Short URL copied to clipboard");
  };

  const handlePublishToggle = async (form: FormRow) => {
    setIsLoading(true);
    const result = await toggleFormPublish(form.formId, !form.isPublished);
    if (result.status === "success") {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!selectedForm) return;
    setIsLoading(true);
    const result = await deleteForm(selectedForm.formId);
    if (result.status === "success") {
      toast.success(result.message);
      setDeleteDialogOpen(false);
      router.refresh();
    } else {
      toast.error(result.message);
    }
    setIsLoading(false);
  };

  if (forms.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        No forms yet. Create your first form to get started.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Short URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Responses</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {forms.map((form) => (
              <TableRow key={form.id}>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium">{form.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{form.description || "No description"}</p>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">{form.formId}</TableCell>
                <TableCell>
                  <Badge variant={form.isPublished ? "default" : "secondary"}>
                    {form.isPublished ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell>{form._count.responses}</TableCell>
                <TableCell>{new Date(form.updatedAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/forms/${form.formId}`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Form
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/forms/${form.formId}/responses`}>
                          <Inbox className="mr-2 h-4 w-4" />
                          View Responses
                          {form._count.responses > 0 && (
                            <span className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded-md font-mono">
                              {form._count.responses}
                            </span>
                          )}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCopy(form.formId)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Short URL
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/forms/${form.formId}`} target="_blank">
                          <Eye className="mr-2 h-4 w-4" />
                          Open Public Form
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePublishToggle(form)} disabled={isLoading}>
                        {form.isPublished ? (
                          <>
                            <ToggleLeft className="mr-2 h-4 w-4" />
                            Unpublish
                          </>
                        ) : (
                          <>
                            <ToggleRight className="mr-2 h-4 w-4" />
                            Publish
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          setSelectedForm(form);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete form?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{selectedForm?.title}</strong> and all of its responses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
