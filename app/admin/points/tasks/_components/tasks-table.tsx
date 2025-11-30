"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Calendar, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { TaskData } from "@/app/admin/tasks/actions";
import { useRouter } from "next/navigation";

interface TasksTableProps {
  tasks: TaskData[];
}

export default function TasksTable({ tasks }: TasksTableProps) {
  const router = useRouter();

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
          No tasks found. Create tasks from the Tasks Management section.
        </p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => router.push("/admin/tasks")}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Go to Tasks Management
        </Button>
      </div>
    );
  }

  return (
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
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => router.push(`/admin/tasks/${task.taskNumber}`)}
                  >
                    <Eye className="h-4 w-4 mr-2 text-blue-500" />
                    View Submissions
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
