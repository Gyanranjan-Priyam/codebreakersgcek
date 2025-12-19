"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface AttendanceSession {
  id: string;
  sessionNumber: number;
  title: string;
  date: string;
  day: string;
  _count: {
    attendances: number;
    qrCodes: number;
  };
}

interface SessionsTableProps {
  sessions: AttendanceSession[];
  selectedSession: string;
  onSelectSession: (sessionId: string) => void;
}

export default function SessionsTable({
  sessions,
  selectedSession,
  onSelectSession,
}: SessionsTableProps) {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No attendance sessions found. Create your first session to get started.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Session #</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Day</TableHead>
            <TableHead className="text-center">Attendance</TableHead>
            <TableHead className="text-center">QR Codes</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
            <TableRow
              key={session.id}
              className={`cursor-pointer ${
                selectedSession === session.id ? "bg-muted" : ""
              }`}
              onClick={() => onSelectSession(session.id)}
            >
              <TableCell className="font-medium">
                <Badge variant="outline">#{session.sessionNumber}</Badge>
              </TableCell>
              <TableCell className="font-medium">{session.title}</TableCell>
              <TableCell>
                {format(new Date(session.date), "MMM dd, yyyy")}
              </TableCell>
              <TableCell>{session.day}</TableCell>
              <TableCell className="text-center">
                <Badge variant="secondary">
                  {session._count.attendances}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="secondary">
                  {session._count.qrCodes}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {selectedSession === session.id && (
                  <Badge variant="default">Selected</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
