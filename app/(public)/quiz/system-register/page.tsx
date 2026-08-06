"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { registerExternalSystem, getSystemState } from "@/app/admin/quizzes/actions";
import { Monitor, Key, Loader2, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { getPusherClient } from "@/lib/pusher-client";

export default function SystemRegisterPage() {
  const router = useRouter();
  const [accessCode, setAccessCode] = useState("");
  const [systemNumber, setSystemNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeSession, setActiveSession] = useState<{
    systemCode: string;
    systemNumber: string;
    quizTitle: string;
    quizId: string;
  } | null>(null);

  const [liveState, setLiveState] = useState<any>(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("cb_external_system_session");
    if (saved) {
      try {
        setActiveSession(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Real-time WebSockets subscription with Pusher + fallback check
  useEffect(() => {
    if (!activeSession?.systemCode) return;

    const checkState = async () => {
      const res = await getSystemState(activeSession.systemCode);
      if (res.status === "success" && res.data) {
        setLiveState(res.data);
        if (res.data.status === "IN_PROGRESS") {
          toast.success("Quiz started! Launching exam environment...");
          router.push(`/quiz-external/${activeSession.systemCode}`);
        }
      }
    };

    checkState();

    // Subscribe to Pusher channel for 0ms instant WebSockets updates
    const pusher = getPusherClient();
    if (pusher) {
      const channelName = `system-${activeSession.systemCode}`;
      const channel = pusher.subscribe(channelName);
      channel.bind("status-changed", () => {
        checkState();
      });
      channel.bind("quiz-started", () => {
        toast.success("Quiz started! Launching exam environment...");
        router.push(`/quiz-external/${activeSession.systemCode}`);
      });

      return () => {
        channel.unbind_all();
        pusher.unsubscribe(channelName);
      };
    }
  }, [activeSession, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode || accessCode.length !== 6) {
      toast.error("Please enter a valid 6-digit access code");
      return;
    }
    if (!systemNumber.trim()) {
      toast.error("Please enter your System / Desk Number");
      return;
    }

    setIsSubmitting(true);
    const res = await registerExternalSystem(accessCode, systemNumber);

    if (res.status === "success" && res.data) {
      toast.success("System registered successfully!");
      const sessionData = {
        systemCode: res.data.systemCode,
        systemNumber: res.data.systemNumber,
        quizTitle: res.data.quizTitle,
        quizId: res.data.quizId,
      };
      setActiveSession(sessionData);
      localStorage.setItem("cb_external_system_session", JSON.stringify(sessionData));
    } else {
      toast.error(res.message || "Failed to register system");
    }
    setIsSubmitting(false);
  };

  const handleDisconnect = () => {
    localStorage.removeItem("cb_external_system_session");
    setActiveSession(null);
    setLiveState(null);
    toast.info("System registration cleared");
  };

  // ── Registered & Waiting Screen ──
  if (activeSession) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-background to-muted">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{activeSession.systemNumber}</CardTitle>
                <CardDescription className="mt-1">
                  Registered for: <strong>{activeSession.quizTitle}</strong>
                </CardDescription>
              </div>
              <Badge variant="default" className="bg-green-600 text-white text-xs">
                ✓ Connected
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Session token */}
            <div className="flex items-center justify-between text-sm p-3 bg-muted rounded-lg">
              <span className="text-muted-foreground">Session Token</span>
              <span className="font-mono text-xs">{activeSession.systemCode}</span>
            </div>

            {/* Live Status */}
            <div className="p-4 bg-muted rounded-lg space-y-3">
              {liveState?.status === "ASSIGNED" ? (
                <>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Candidate Assigned</span>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">{liveState.assignedStudentName}</p>
                    <p className="text-xs text-muted-foreground font-mono">{liveState.assignedStudentEmail}</p>
                    {liveState.assignedSet && (
                      <Badge variant="outline" className="text-xs mt-1">
                        Assigned Set {liveState.assignedSet}
                      </Badge>
                    )}
                  </div>
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      Waiting for admin to start the quiz...
                    </AlertDescription>
                  </Alert>
                </>
              ) : liveState?.status === "IN_PROGRESS" ? (
                <Alert>
                  <AlertDescription className="text-sm font-semibold">
                    Exam starting — redirecting now...
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    System ready. Waiting for admin to assign your candidate details. Keep this tab open.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Standard proctoring rules, tab-switch monitoring, and fullscreen enforcement apply once the quiz starts.
              </AlertDescription>
            </Alert>

            <div className="pt-2 text-center">
              <Button variant="ghost" size="sm" onClick={handleDisconnect} className="text-muted-foreground text-xs">
                Clear Registration
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Registration Form ──
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-background to-muted">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Monitor className="h-6 w-6" />
            External Exam System Registration
          </CardTitle>
          <CardDescription>
            Enter the 6-digit quiz access code and your system/desk number to connect this computer to the exam.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium flex items-center gap-2">
                <Key className="h-4 w-4" />
                6-Digit Access Code
              </label>
              <Input
                type="text"
                maxLength={6}
                placeholder="e.g. 849201"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.replace(/\D/g, ""))}
                className="text-center font-mono text-2xl tracking-widest h-12"
              />
              <p className="text-xs text-muted-foreground">
                Displayed on the Admin panel — enter exactly as shown.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                System / Desk Number
              </label>
              <Input
                type="text"
                placeholder="e.g. SYS-01 or Desk 12"
                value={systemNumber}
                onChange={(e) => setSystemNumber(e.target.value)}
                className="h-12"
              />
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Once registered, keep this tab open. The exam will launch automatically when the admin starts it.
              </AlertDescription>
            </Alert>

            <Button type="submit" disabled={isSubmitting} className="w-full h-11" size="lg">
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Register System"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
