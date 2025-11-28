"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { MoreHorizontal, Edit, Trash2, Eye, ToggleLeft, ToggleRight, BarChart3 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteQuiz, toggleQuizStatus } from "../actions";

interface Quiz {
  id: string;
  quizId: string;
  title: string;
  description: string;
  sets: number;
  duration: number;
  isActive: boolean;
  createdAt: Date;
  _count?: {
    attempts: number;
  };
}

interface QuizzesTableProps {
  quizzes: Quiz[];
}

export default function QuizzesTable({ quizzes }: QuizzesTableProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!selectedQuiz) return;

    setIsLoading(true);
    const result = await deleteQuiz(selectedQuiz.id);

    if (result.status === "success") {
      toast.success("Quiz deleted successfully");
      setDeleteDialogOpen(false);
      router.refresh();
    } else {
      toast.error(result.message || "Failed to delete quiz");
    }
    setIsLoading(false);
  };

  const handleToggleStatus = async (quiz: Quiz) => {
    const result = await toggleQuizStatus(quiz.id, !quiz.isActive);

    if (result.status === "success") {
      toast.success(`Quiz ${quiz.isActive ? "deactivated" : "activated"} successfully`);
      router.refresh();
    } else {
      toast.error(result.message || "Failed to toggle quiz status");
    }
  };

  if (quizzes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No quizzes found. Create your first quiz!</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[100px]">Quiz ID</TableHead>
              <TableHead className="min-w-[200px]">Title</TableHead>
              <TableHead className="min-w-20">Sets</TableHead>
              <TableHead className="min-w-[100px]">Duration</TableHead>
              <TableHead className="min-w-[100px]">Status</TableHead>
              <TableHead className="min-w-[100px]">Attempts</TableHead>
              <TableHead className="min-w-[120px]">Created</TableHead>
              <TableHead className="text-right min-w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quizzes.map((quiz) => (
              <TableRow key={quiz.id}>
                <TableCell className="font-mono text-sm">
                  {quiz.quizId}
                </TableCell>
                <TableCell className="font-medium">{quiz.title}</TableCell>
                <TableCell>
                  <Badge variant="outline">{quiz.sets} set{quiz.sets > 1 ? "s" : ""}</Badge>
                </TableCell>
                <TableCell>{quiz.duration} min</TableCell>
                <TableCell>
                  <Badge variant={quiz.isActive ? "default" : "secondary"}>
                    {quiz.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>{quiz._count?.attempts || 0}</TableCell>
                <TableCell>
                  {new Date(quiz.createdAt).toLocaleDateString()}
                </TableCell>
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
                        <Link href={`/admin/quizzes/${quiz.quizId}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/quizzes/edit/${quiz.quizId}`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Quiz
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/quizzes/results/${quiz.quizId}`}>
                          <BarChart3 className="h-4 w-4 mr-2" />
                          View Results
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(quiz)}>
                        {quiz.isActive ? (
                          <>
                            <ToggleLeft className="h-4 w-4 mr-2" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <ToggleRight className="h-4 w-4 mr-2" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          setSelectedQuiz(quiz);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
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
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the quiz &quot;{selectedQuiz?.title}&quot; and all
              associated attempts. This action cannot be undone.
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
