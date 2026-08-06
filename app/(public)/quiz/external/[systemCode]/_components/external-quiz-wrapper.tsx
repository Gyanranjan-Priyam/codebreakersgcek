"use client";

import { useState, useEffect } from "react";
import QuizProctorInterface from "@/app/(public)/quiz/[quizId]/[identifier]/_components/quiz-proctor-interface";
import { submitExternalQuizAttemptFromInterface } from "../actions";
import { getSystemState } from "@/app/admin/quizzes/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShieldAlert, FileText } from "lucide-react";
import { getPusherClient } from "@/lib/pusher-client";
import { toast } from "sonner";

interface ExternalQuizWrapperProps {
  quiz: any;
  user: {
    id: string;
    name: string;
    email: string;
    registration?: string | null;
    username?: string | null;
    mobile?: string | null;
    branch?: string | null;
  };
  assignedSet: string;
  systemCode: string;
  isCompleted?: boolean;
  isBlocked?: boolean;
  isAttempting?: boolean;
  blockReason?: string;
}

export default function ExternalQuizWrapper({
  quiz,
  user,
  assignedSet,
  systemCode,
  isCompleted = false,
  isBlocked = false,
  isAttempting = false,
  blockReason,
}: ExternalQuizWrapperProps) {
  const [liveIsBlocked, setLiveIsBlocked] = useState(isBlocked);

  // Sync state if props change
  useEffect(() => {
    setLiveIsBlocked(isBlocked);
  }, [isBlocked]);

  // Pusher WebSockets real-time unblock listener + rapid status check when blocked
  useEffect(() => {
    if (!systemCode) return;

    // 1. WebSockets channel listener
    const pusher = getPusherClient();
    let channel: any = null;

    if (pusher) {
      const channelName = `system-${systemCode}`;
      channel = pusher.subscribe(channelName);

      channel.bind("unblocked", () => {
        setLiveIsBlocked(false);
        toast.success("You have been unblocked by the administrator! Resuming exam...");
      });

      channel.bind("status-changed", (data: { status?: string }) => {
        if (data?.status === "ATTEMPTING" || data?.status === "IN_PROGRESS") {
          setLiveIsBlocked(false);
        } else if (data?.status === "BLOCKED") {
          setLiveIsBlocked(true);
        }
      });
    }

    // 2. Rapid status polling fallback when blocked to guarantee instant unblock
    let pollTimer: NodeJS.Timeout | null = null;
    if (liveIsBlocked) {
      pollTimer = setInterval(async () => {
        const res = await getSystemState(systemCode);
        if (res.status === "success" && res.data) {
          if (res.data.status === "ATTEMPTING" || res.data.status === "IN_PROGRESS") {
            setLiveIsBlocked(false);
            toast.success("Unblocked by administrator! Continuing exam...");
          }
        }
      }, 2000);
    }

    return () => {
      if (channel && pusher) {
        channel.unbind_all();
        pusher.unsubscribe(`system-${systemCode}`);
      }
      if (pollTimer) {
        clearInterval(pollTimer);
      }
    };
  }, [systemCode, liveIsBlocked]);

  // If candidate is blocked — show blocked error screen
  if (liveIsBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="max-w-md w-full space-y-4 text-center p-6 border rounded-xl bg-card shadow-lg">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-destructive">Quiz Access Blocked</h1>
          <p className="text-muted-foreground text-sm">
            Access to this quiz has been blocked for system <strong>{user.registration || systemCode}</strong>.
          </p>
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive text-left font-mono">
            Reason: {blockReason || "Multiple proctoring violations detected"}
          </div>
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive flex items-center justify-center gap-2 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
            </span>
            Waiting for administrator unblock... Screen will update automatically once unblocked.
          </div>
        </div>
      </div>
    );
  }

  // Already submitted — show submitted screen immediately!
  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="max-w-md w-full space-y-4 text-center p-6 border rounded-xl bg-card shadow-lg">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold">Quiz Already Submitted</h1>
          <p className="text-muted-foreground text-sm">
            Your responses have already been submitted and recorded for system <strong>{user.registration || systemCode}</strong>.
          </p>
          <p className="text-xs text-muted-foreground">
            Official scorecard will be emailed to <strong>{user.email}</strong> once published by administrator.
          </p>
          {quiz.feedbackFormId && (
            <Button
              asChild
              className="w-full mt-4 font-bold bg-primary text-primary-foreground hover:opacity-90 rounded-xl"
            >
              <a href={`/forms/${quiz.feedbackFormId}`} target="_blank" rel="noopener noreferrer">
                <FileText className="h-4 w-4 mr-2" />
                Fill Feedback Form
              </a>
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Bind the systemCode into the server action call
  const handleExternalSubmit = async (data: {
    quizId: string;
    quizDbId: string;
    assignedSet: string;
    answers: Record<number, number>;
    tabSwitches: number;
    questionsJson: string;
  }) => {
    return submitExternalQuizAttemptFromInterface({ ...data, systemCode });
  };

  const afterSubmitContent = (
    <div className="space-y-4 w-full">
      <Alert>
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-xs">
          Your results will be reviewed and published by the administrator. An official scorecard will be emailed to{" "}
          <strong>{user.email}</strong> once released.
        </AlertDescription>
      </Alert>
      {quiz.feedbackFormId && (
        <Button
          asChild
          className="w-full font-bold bg-primary text-primary-foreground hover:opacity-90 rounded-xl"
        >
          <a href={`/forms/${quiz.feedbackFormId}`} target="_blank" rel="noopener noreferrer">
            <FileText className="h-4 w-4 mr-2" />
            Fill Feedback Form
          </a>
        </Button>
      )}
    </div>
  );

  return (
    <QuizProctorInterface
      quiz={quiz}
      user={user}
      hasExistingAttempt={isCompleted || liveIsBlocked}
      assignedSet={assignedSet}
      onSubmit={handleExternalSubmit}
      afterSubmitContent={afterSubmitContent}
      systemCode={systemCode}
      initialStep={isAttempting || !liveIsBlocked ? "quiz-started" : "user-info"}
    />
  );
}
