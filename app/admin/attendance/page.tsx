"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Users, ListChecks } from "lucide-react";
import { SilentRefreshButton } from "@/components/ui/silent-refresh-button";
import CreateSessionDialog from "./_components/create-session-dialog";
import SessionsTable from "./_components/sessions-table";
import StudentQRScanner from "./_components/student-qr-scanner";

interface AttendanceSession {
  id: string;
  sessionNumber: number;
  title: string;
  date: string;
  day: string;
  _count: {
    attendances: number;
  };
}

export default function AttendanceQRPage() {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>("");

  // Fetch attendance sessions on mount
  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/admin/attendance/sessions");
      const data = await response.json();

      if (data.success) {
        setSessions(data.sessions);
        // Automatically select the most recent session if none selected
        if (data.sessions.length > 0) {
          setSelectedSession((current) => {
            const exists = data.sessions.some((s: AttendanceSession) => s.id === current);
            return exists ? current : data.sessions[0].id;
          });
        } else {
          setSelectedSession("");
        }
      } else {
        toast.error("Failed to fetch attendance sessions");
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast.error("Error loading attendance sessions");
    }
  };

  const selectedSessionData = sessions.find((s) => s.id === selectedSession);

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Attendance Scanner</h1>
          <p className="text-sm text-muted-foreground">
            Scan student QR codes to mark attendance as present and manage sessions
          </p>
        </div>
        <CreateSessionDialog onSessionCreated={fetchSessions} />
      </div>

      {/* Session Selector Card */}
      <Card className="border-border">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Active Attendance Session
              </label>
              <Select value={selectedSession} onValueChange={setSelectedSession}>
                <SelectTrigger className="w-full sm:max-w-md">
                  <SelectValue placeholder="Choose an attendance session..." />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((session) => (
                    <SelectItem key={session.id} value={session.id}>
                      Session #{session.sessionNumber}: {session.title} ({session.day})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedSessionData && (
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="secondary" className="px-3 py-1 text-xs">
                  Session #{selectedSessionData.sessionNumber}
                </Badge>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    {selectedSessionData._count?.attendances || 0} students marked
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Student QR Scanner Section */}
      <div className="space-y-4">
        {selectedSessionData ? (
          <StudentQRScanner
            sessionId={selectedSession}
            sessionTitle={`Session #${selectedSessionData.sessionNumber}: ${selectedSessionData.title}`}
            onScanSuccess={fetchSessions}
          />
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground text-sm">
              No attendance session selected. Create a new session or select an existing session above to start scanning student QR codes.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Attendance Sessions Table with View Details & Delete Actions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ListChecks className="h-5 w-5 text-primary" />
                All Attendance Sessions ({sessions.length})
              </CardTitle>
              <CardDescription className="mt-1">
                Manage sessions, select active scanner session, view detailed attendance lists, or delete sessions.
              </CardDescription>
            </div>
            <SilentRefreshButton onRefresh={fetchSessions} toastMessage="Attendance sessions refreshed" />
          </div>
        </CardHeader>
        <CardContent>
          <SessionsTable
            sessions={sessions}
            selectedSession={selectedSession}
            onSelectSession={setSelectedSession}
            onSessionDeleted={fetchSessions}
          />
        </CardContent>
      </Card>
    </div>
  );
}
