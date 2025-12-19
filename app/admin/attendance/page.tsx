"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { QrCode, Clock, Users, X, RefreshCw } from "lucide-react";
import Image from "next/image";
import CreateSessionDialog from "./_components/create-session-dialog";
import SessionsTable from "./_components/sessions-table";
import LiveAttendanceList from "./_components/live-attendance-list";

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

interface QRCodeData {
  qrCode: string;
  qrToken: string;
  expiresAt: string;
  sessionId: string;
  sessionTitle: string;
}

interface ActiveQRCode {
  id: string;
  qrToken: string;
  expiresAt: string;
  createdAt: string;
  scanCount: number;
  session: {
    title: string;
    date: string;
  };
}

export default function AttendanceQRPage() {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [qrCodeData, setQrCodeData] = useState<QRCodeData | null>(null);
  const [activeQRCodes, setActiveQRCodes] = useState<ActiveQRCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);

  // Fetch attendance sessions
  useEffect(() => {
    fetchSessions();
  }, []);

  // Timer for QR code expiration
  useEffect(() => {
    if (qrCodeData?.expiresAt) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const expiry = new Date(qrCodeData.expiresAt).getTime();
        const remaining = Math.max(0, Math.floor((expiry - now) / 1000));
        
        setTimeRemaining(remaining);
        
        if (remaining === 0 && !isExpired) {
          setIsExpired(true);
          toast.error("QR code has expired!");
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [qrCodeData, isExpired]);

  // Fetch active QR codes for selected session
  useEffect(() => {
    if (selectedSession) {
      fetchActiveQRCodes(selectedSession);
    }
  }, [selectedSession]);

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/admin/attendance/sessions");
      const data = await response.json();
      
      if (data.success) {
        setSessions(data.sessions);
      } else {
        toast.error("Failed to fetch attendance sessions");
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast.error("Error loading attendance sessions");
    }
  };

  const fetchActiveQRCodes = async (sessionId: string) => {
    try {
      const response = await fetch(
        `/api/admin/attendance/qr-status?sessionId=${sessionId}`
      );
      const data = await response.json();
      
      if (data.success) {
        setActiveQRCodes(data.qrCodes);
      }
    } catch (error) {
      console.error("Error fetching active QR codes:", error);
    }
  };

  const generateQRCode = async () => {
    if (!selectedSession) {
      toast.error("Please select an attendance session");
      return;
    }

    setLoading(true);
    setIsExpired(false);

    try {
      const response = await fetch("/api/admin/attendance/generate-qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId: selectedSession }),
      });

      const data = await response.json();

      if (data.success) {
        setQrCodeData(data);
        toast.success("QR code generated successfully!");
        fetchActiveQRCodes(selectedSession);
      } else {
        toast.error(data.error || "Failed to generate QR code");
      }
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error("Error generating QR code");
    } finally {
      setLoading(false);
    }
  };

  const deactivateQRCode = async (qrToken: string) => {
    try {
      const response = await fetch("/api/admin/attendance/qr-status", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ qrToken }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("QR code deactivated");
        if (qrCodeData?.qrToken === qrToken) {
          setQrCodeData(null);
        }
        if (selectedSession) {
          fetchActiveQRCodes(selectedSession);
        }
      } else {
        toast.error(data.error || "Failed to deactivate QR code");
      }
    } catch (error) {
      console.error("Error deactivating QR code:", error);
      toast.error("Error deactivating QR code");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const selectedSessionData = sessions.find(s => s.id === selectedSession);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">QR Code Attendance</h1>
          <p className="text-muted-foreground">
            Generate QR codes for students to scan and mark their attendance
          </p>
        </div>
        <CreateSessionDialog onSessionCreated={fetchSessions} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Session Selection & QR Generation */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Generate QR Code</CardTitle>
            <CardDescription>
              Select a session and generate a QR code (valid for 5 minutes)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Session</label>
              <Select value={selectedSession} onValueChange={setSelectedSession}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an attendance session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((session) => (
                    <SelectItem key={session.id} value={session.id}>
                      Session {session.sessionNumber}: {session.title} ({session.day})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedSessionData && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Session Details</span>
                  <Badge variant="secondary">
                    Session {selectedSessionData.sessionNumber}
                  </Badge>
                </div>
                <p className="text-sm">{selectedSessionData.title}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {selectedSessionData._count.attendances} marked
                  </span>
                  <span className="flex items-center gap-1">
                    <QrCode className="h-4 w-4" />
                    {selectedSessionData._count.qrCodes} QR codes
                  </span>
                </div>
              </div>
            )}

            <Button
              onClick={generateQRCode}
              disabled={!selectedSession || loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <QrCode className="mr-2 h-4 w-4" />
                  Generate New QR Code
                </>
              )}
            </Button>

            {activeQRCodes.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Active QR Codes</label>
                {activeQRCodes.map((qr) => (
                  <div
                    key={qr.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="text-sm">
                      <p className="font-medium">
                        Scans: {qr.scanCount}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Expires: {new Date(qr.expiresAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deactivateQRCode(qr.qrToken)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live Attendance List */}
        <LiveAttendanceList 
          sessionId={selectedSession} 
          isActive={qrCodeData !== null && !isExpired}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* QR Code Display */}
        <Card>
          <CardHeader>
            <CardTitle>QR Code Display</CardTitle>
            <CardDescription>
              Show this QR code to students for scanning
            </CardDescription>
          </CardHeader>
          <CardContent>
            {qrCodeData ? (
              <div className="space-y-4">
                <div className="relative bg-white p-8 rounded-lg border-4 border-primary">
                  <Image
                    src={qrCodeData.qrCode}
                    alt="Attendance QR Code"
                    width={512}
                    height={512}
                    className="w-full h-auto"
                    priority
                  />
                  {isExpired && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
                      <div className="text-center text-white">
                        <Clock className="h-12 w-12 mx-auto mb-2" />
                        <p className="font-bold text-lg">QR Code Expired</p>
                        <p className="text-sm">Generate a new code</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Session</p>
                      <p className="text-lg">{qrCodeData.sessionTitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      <div>
                        <p className="text-sm font-medium">Time Remaining</p>
                        <p className={`text-2xl font-bold ${timeRemaining < 60 ? 'text-red-500' : 'text-green-500'}`}>
                          {formatTime(timeRemaining)}
                        </p>
                      </div>
                    </div>
                    {!isExpired && (
                      <Badge variant={timeRemaining < 60 ? "destructive" : "default"}>
                        {timeRemaining < 60 ? "Expiring Soon" : "Active"}
                      </Badge>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => deactivateQRCode(qrCodeData.qrToken)}
                    className="w-full"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Deactivate QR Code
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <QrCode className="h-24 w-24 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No QR Code Generated</h3>
                <p className="text-sm text-muted-foreground">
                  Select a session and click &quot;Generate New QR Code&quot; to start
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Attendance Sessions</CardTitle>
          <CardDescription>
            Click on a session to select it for QR code generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SessionsTable
            sessions={sessions}
            selectedSession={selectedSession}
            onSelectSession={setSelectedSession}
          />
        </CardContent>
      </Card>
    </div>
  );
}
