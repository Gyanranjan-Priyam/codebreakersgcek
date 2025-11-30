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
import { Button } from "@/components/ui/button";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Eye, MoreVertical, Calendar } from "lucide-react";
import { format } from "date-fns";
import { TaskData, deleteTask } from "../actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import EditTaskDialog from "./edit-task-dialog";

interface TasksTableProps {
  tasks: TaskData[];
}

export default function TasksTable({ tasks }: TasksTableProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!selectedTask) return;

    setIsDeleting(true);
    try {
      const result = await deleteTask(selectedTask.id);

      if (result.status === "success") {
        toast.success(result.message);
        setDeleteDialogOpen(false);
        setSelectedTask(null);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const getTaskStatus = (startDate: Date, dueDate: Date) => {
    const now = new Date();
    const start = new Date(startDate);
    const due = new Date(dueDate);

    if (now < start) {
      return { label: "Upcoming", variant: "secondary" as const };
    } else if (now > due) {
      return { label: "Overdue", variant: "destructive" as const };
    } else {
      return { label: "Active", variant: "default" as const };
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground">
          No tasks found. Create your first task to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task #</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => {
              const status = getTaskStatus(task.startDate, task.dueDate);
              return (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">
                    <Badge variant="outline">#{task.taskNumber}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {format(new Date(task.startDate), "MMM dd, yyyy")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {format(new Date(task.dueDate), "MMM dd, yyyy")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{task.points} pts</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            router.push(`/admin/tasks/${task.taskNumber}`);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2 text-blue-500" />
                          View Submissions
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedTask(task);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2 text-green-500" />
                          Edit Task
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedTask(task);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Task
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {selectedTask && (
        <EditTaskDialog
          task={selectedTask}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete task #{selectedTask?.taskNumber} - {selectedTask?.title}.
              All submissions will also be deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
