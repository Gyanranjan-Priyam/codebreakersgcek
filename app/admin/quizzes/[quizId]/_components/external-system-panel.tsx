"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  assignStudentToSystem,
  unassignStudentFromSystem,
  startSystemQuiz,
  startAllSystems,
  getStudentDetailsByResponseId,
  getQuizMonitorData,
  unblockQuizCandidate,
  deleteExternalSystem,
  clearAllExternalSystems,
  autoShuffleAndAssignSets,
} from "../../actions";
import { getSocket, initSocket, joinRoom } from "@/lib/socket-client";
import {
  Monitor,
  UserPlus,
  Play,
  CheckCircle2,
  Copy,
  RefreshCw,
  Clock,
  UserCheck,
  Zap,
  Loader2,
  Search,
  ShieldAlert,
  Unlock,
  User,
  Trash2,
  Shuffle,
  AlertTriangle,
} from "lucide-react";

interface FormResponseOption {
  id: string;
  submittedByName?: string;
  submittedByEmail?: string;
}

interface ExternalSystemPanelProps {
  quizId: string;
  accessCode: string | null;
  sets: number;
  formId: string | null;
  formResponses?: FormResponseOption[];
}

export function ExternalSystemPanel({
  quizId,
  accessCode,
  sets,
  formId,
  formResponses = [],
}: ExternalSystemPanelProps) {
  const [systems, setSystems] = useState<any[]>([]);
  const [blockedMembers, setBlockedMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isPending, startTransition] = useTransition();

  // Blocked members right sidebar sheet state
  const [blockedSidebarOpen, setBlockedSidebarOpen] = useState(false);

  // Assign dialog state
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<any>(null);
  const [selectedResponseId, setSelectedResponseId] = useState<string>("");
  const [customName, setCustomName] = useState<string>("");
  const [customEmail, setCustomEmail] = useState<string>("");
  const [assignedSet, setAssignedSet] = useState<string>("A");
  const [isFetchingResponse, setIsFetchingResponse] = useState(false);
  const [fetchedNotice, setFetchedNotice] = useState<string | null>(null);

  // Blocked member details modal state
  const [selectedBlockedMember, setSelectedBlockedMember] = useState<any>(null);
  const [isUnblocking, setIsUnblocking] = useState(false);
  // Fetch all monitor data from server
  const fetchMonitorData = async (showToast = false) => {
    setIsRefreshing(true);
    const res = await getQuizMonitorData(quizId);
    if (res.status === "success" && res.data) {
      setSystems(res.data.systems || []);
      setBlockedMembers(res.data.blockedMembers || []);
      setLastUpdated(new Date());
      if (showToast) toast.success("Refreshed systems & blocked members data");
    }
    setIsLoading(false);
    setIsRefreshing(false);
  };

  // Debounce ref for Socket.IO events to prevent thundering herd
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const debouncedFetch = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchMonitorData();
    }, 300);
  };

  // Real-time Socket.IO subscription + fast fallback polling
  useEffect(() => {
    fetchMonitorData();

    // Initialize Socket.IO and subscribe to quiz room
    let leaveRoom: (() => void) | null = null;

    initSocket().then((socket) => {
      if (!socket) return;

      leaveRoom = joinRoom(`quiz-${quizId}`);

      socket.on("system-updated", debouncedFetch);
      socket.on("blocked-updated", debouncedFetch);
      socket.on("quiz-started-all", debouncedFetch);
    });

    // Fast fallback polling (5s) — ensures updates even if Socket.IO event is missed
    let intervalId: NodeJS.Timeout | null = null;
    const startPolling = () => {
      if (!intervalId) {
        intervalId = setInterval(() => {
          if (document.visibilityState === "visible") {
            fetchMonitorData();
          }
        }, 5000);
      }
    };
    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchMonitorData();
        startPolling();
      } else {
        stopPolling();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    startPolling();

    return () => {
      if (leaveRoom) leaveRoom();
      const socket = getSocket();
      if (socket) {
        socket.off("system-updated", debouncedFetch);
        socket.off("blocked-updated", debouncedFetch);
        socket.off("quiz-started-all", debouncedFetch);
      }
      if (debounceRef.current) clearTimeout(debounceRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopPolling();
    };
  }, [quizId]);

  const copyAccessCode = () => {
    if (accessCode) {
      navigator.clipboard.writeText(accessCode);
      toast.success("6-Digit Quiz Access Code copied!");
    }
  };

  // Auto-fetch student details by Response ID
  const handleFetchByResponseId = async (respId: string) => {
    if (!respId || !respId.trim() || respId === "custom") return;

    setIsFetchingResponse(true);
    setFetchedNotice(null);

    const res = await getStudentDetailsByResponseId(respId.trim());

    if (res.status === "success" && res.data) {
      if (res.data.studentName) setCustomName(res.data.studentName);
      if (res.data.studentEmail) setCustomEmail(res.data.studentEmail);
      setFetchedNotice(`Auto-fetched: ${res.data.studentName} (${res.data.studentEmail || "No Email"})`);
      toast.success(`Fetched candidate details for Response ID ${respId.slice(0, 8)}...`);
    } else {
      setFetchedNotice(null);
      toast.error(res.message || "Could not find form response with this ID");
    }
    setIsFetchingResponse(false);
  };

  const handleOpenAssignModal = (sys: any) => {
    setSelectedSystem(sys);
    setSelectedResponseId("");
    setCustomName(sys.assignedStudentName || "");
    setCustomEmail(sys.assignedStudentEmail || "");
    const sysIndex = systems.findIndex((s) => s.id === sys.id);
    const numSets = sets || 1;
    const alternatingSet = String.fromCharCode(65 + (Math.max(0, sysIndex) % numSets));
    setAssignedSet(sys.assignedSet || alternatingSet);
    setAssignDialogOpen(true);
  };

  const handleAssignStudent = async () => {
    if (!selectedSystem) return;

    let finalName = customName.trim();
    let finalEmail = customEmail.trim();

    if (selectedResponseId && selectedResponseId !== "custom") {
      const matched = formResponses.find((r) => r.id === selectedResponseId);
      if (matched) {
        if (!finalName && matched.submittedByName) finalName = matched.submittedByName;
        if (!finalEmail && matched.submittedByEmail) finalEmail = matched.submittedByEmail;
      }
    }

    if (!finalName || !finalEmail) {
      toast.error("Participant Name and Email are required");
      return;
    }

    const res = await assignStudentToSystem({
      systemId: selectedSystem.id,
      formResponseId: selectedResponseId !== "custom" ? selectedResponseId : undefined,
      studentName: finalName,
      studentEmail: finalEmail,
      assignedSet,
    });

    if (res.status === "success") {
      toast.success(`Assigned ${finalName} to ${selectedSystem.systemNumber}`);
      setAssignDialogOpen(false);
      fetchMonitorData();
    } else {
      toast.error(res.message || "Failed to assign student");
    }
  };

  const handleUnassign = async (sysId: string) => {
    const res = await unassignStudentFromSystem(sysId);
    if (res.status === "success") {
      toast.success("Student unassigned");
      fetchMonitorData();
    } else {
      toast.error(res.message);
    }
  };

  const handleStartQuiz = async (sysId: string, sysNum: string) => {
    const res = await startSystemQuiz(sysId);
    if (res.status === "success") {
      toast.success(`Quiz started for ${sysNum}`);
      fetchMonitorData();
    } else {
      toast.error(res.message);
    }
  };

  const handleStartAll = async () => {
    const res = await startAllSystems(quizId);
    if (res.status === "success") {
      toast.success("Quiz started for all assigned systems!");
      fetchMonitorData();
    } else {
      toast.error(res.message);
    }
  };

  const handleUnblockMember = async (userId: string) => {
    setIsUnblocking(true);
    const res = await unblockQuizCandidate(quizId, userId);
    if (res.status === "success") {
      toast.success("Candidate unblocked successfully");
      setSelectedBlockedMember(null);
      fetchMonitorData();
    } else {
      toast.error(res.message || "Failed to unblock candidate");
    }
    setIsUnblocking(false);
  };

  const handleDeleteSystem = async (sysId: string, sysNum: string) => {
    if (!window.confirm(`Are you sure you want to remove system ${sysNum}? This will disconnect the kiosk.`)) return;
    const res = await deleteExternalSystem(sysId);
    if (res.status === "success") {
      toast.success(`Removed system ${sysNum}`);
      fetchMonitorData();
    } else {
      toast.error(res.message || "Failed to remove system");
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm(`Are you sure you want to clear and disconnect all ${systems.length} systems? This cannot be undone.`)) return;
    const res = await clearAllExternalSystems(quizId);
    if (res.status === "success") {
      toast.success(res.message);
      fetchMonitorData();
    } else {
      toast.error(res.message || "Failed to clear systems");
    }
  };

  const [isShufflingSets, setIsShufflingSets] = useState(false);

  const handleAutoShuffleSets = async () => {
    setIsShufflingSets(true);
    const res = await autoShuffleAndAssignSets(quizId);
    if (res.status === "success") {
      toast.success(res.message);
      fetchMonitorData();
    } else {
      toast.error(res.message || "Failed to shuffle sets");
    }
    setIsShufflingSets(false);
  };

  const registeredCount = systems.filter((s) => s.status === "REGISTERED").length;
  const assignedCount = systems.filter((s) => s.status === "ASSIGNED").length;
  const attemptingCount = systems.filter((s) => s.status === "ATTEMPTING" || s.status === "IN_PROGRESS").length;
  const completedCount = systems.filter((s) => s.status === "COMPLETED").length;
  const blockedCount = blockedMembers.length;

  return (
    <Card className="rounded-xl border shadow-sm bg-card overflow-hidden">
      <CardHeader className="border-b pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg font-bold">
                Real-Time External Quiz System Monitor
              </CardTitle>
            </div>
            <CardDescription className="text-sm text-muted-foreground mt-0.5">
              Live monitor with smart pause on tab switch · Last updated: {lastUpdated.toLocaleTimeString()}
            </CardDescription>
          </div>

          {/* Access Code Banner */}
          <div className="flex items-center gap-3 bg-muted/40 p-3 rounded-lg border">
            <div className="text-right">
              <div className="text-xs text-muted-foreground uppercase font-semibold">
                6-Digit Access Code
              </div>
              <div className="text-xl font-bold font-mono tracking-widest text-foreground">
                {accessCode || "N/A"}
              </div>
            </div>
            {accessCode && (
              <Button
                variant="outline"
                size="icon"
                onClick={copyAccessCode}
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-lg border bg-muted/20">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase">
              <span>Registered</span>
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold mt-2">{systems.length}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{registeredCount} awaiting assignment</div>
          </div>

          <div className="p-3.5 rounded-lg border bg-muted/20">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase">
              <span>Assigned</span>
              <UserCheck className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-bold text-primary mt-2">{assignedCount}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Ready for quiz launch</div>
          </div>

          <div className="p-3.5 rounded-lg border bg-blue-500/10 border-blue-500/20">
            <div className="flex items-center justify-between text-blue-600 text-xs font-semibold uppercase">
              <span>Attempting</span>
              <Play className="h-4 w-4 text-blue-600 animate-pulse" />
            </div>
            <div className="text-2xl font-bold text-blue-600 mt-2">{attemptingCount}</div>
            <div className="text-xs text-blue-600/80 mt-0.5">Currently taking quiz</div>
          </div>

          <div className="p-3.5 rounded-lg border bg-muted/20">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase">
              <span>Completed</span>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600 mt-2">{completedCount}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Submissions recorded</div>
          </div>

          {/* Clickable Blocked Stat Card -> Opens Right Sidebar Panel */}
          <div
            onClick={() => setBlockedSidebarOpen(true)}
            className="p-3.5 rounded-lg border bg-destructive/10 border-destructive/20 col-span-2 sm:col-span-1 cursor-pointer hover:border-destructive transition-all group"
          >
            <div className="flex items-center justify-between text-destructive text-xs font-semibold uppercase">
              <span>Blocked</span>
              <ShieldAlert className="h-4 w-4 text-destructive group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-bold text-destructive mt-2">{blockedCount}</div>
            <div className="text-xs text-destructive/80 mt-0.5 flex items-center justify-between">
              <span>Violations</span>
              <span className="font-semibold underline text-[11px]">View Panel →</span>
            </div>
          </div>
        </div>

        {/* Action Controls Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1.5 py-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Smart Live Sync Active
            </Badge>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchMonitorData(true)}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh Live
            </Button>

            {/* Blocked Members Button -> Opens Right Sidebar Sheet Panel */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBlockedSidebarOpen(true)}
              className="border-destructive/40 text-destructive hover:bg-destructive/10 font-semibold"
            >
              <ShieldAlert className="h-4 w-4 mr-2 text-destructive" />
              Blocked Members ({blockedCount})
            </Button>

            {sets > 1 && systems.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAutoShuffleSets}
                disabled={isShufflingSets}
                className="border-primary/40 text-primary hover:bg-primary/10 font-semibold"
              >
                <Shuffle className={`h-4 w-4 mr-1.5 ${isShufflingSets ? "animate-spin" : ""}`} />
                Shuffle & Assign Sets
              </Button>
            )}

            {assignedCount > 0 && (
              <Button
                size="sm"
                onClick={handleStartAll}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold"
              >
                <Zap className="h-4 w-4 mr-2" />
                Start Quiz for All Assigned ({assignedCount})
              </Button>
            )}

            {systems.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Clear All Systems ({systems.length})
              </Button>
            )}
          </div>
        </div>

        {/* Real-time Registered Systems Table */}
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="font-semibold text-foreground">System Number</TableHead>
                <TableHead className="font-semibold text-foreground">Session Code</TableHead>
                <TableHead className="font-semibold text-foreground">Assigned Student</TableHead>
                <TableHead className="font-semibold text-foreground">Assigned Set</TableHead>
                <TableHead className="font-semibold text-foreground">Status</TableHead>
                <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {systems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    <Monitor className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    No external systems registered yet.
                    <p className="text-xs text-muted-foreground mt-1">
                      Kiosks can enter Access Code <strong className="font-mono">{accessCode}</strong> at{" "}
                      <code className="bg-muted px-1.5 py-0.5 rounded font-mono">/quiz/system-register</code>
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                systems.map((sys) => (
                  <TableRow key={sys.id}>
                    <TableCell className="font-semibold text-sm">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                        <span>{sys.systemNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {sys.systemCode}
                    </TableCell>
                    <TableCell>
                      {sys.assignedStudentName ? (
                        <div>
                          <div className="font-medium text-sm">{sys.assignedStudentName}</div>
                          <div className="text-xs text-muted-foreground">{sys.assignedStudentEmail}</div>
                        </div>
                      ) : (
                        <span className="text-xs italic text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {sys.assignedSet ? (
                        <Badge variant="outline">
                          Set {sys.assignedSet}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {sys.status === "REGISTERED" && (
                        <Badge variant="outline">
                          Waiting Assignment
                        </Badge>
                      )}
                      {sys.status === "ASSIGNED" && (
                        <Badge variant="secondary">
                          Ready to Start
                        </Badge>
                      )}
                      {(sys.status === "ATTEMPTING" || sys.status === "IN_PROGRESS") && (
                        <Badge variant="default" className="bg-blue-600 text-white animate-pulse">
                          Attempting
                        </Badge>
                      )}
                      {sys.status === "COMPLETED" && (
                        <Badge variant="secondary" className="text-green-600 bg-green-500/10 border-green-600/30">
                          Submitted
                        </Badge>
                      )}
                      {sys.status === "BLOCKED" && (
                        <Badge variant="destructive">
                          Blocked
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-2">
                        {sys.status === "REGISTERED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenAssignModal(sys)}
                          >
                            <UserPlus className="h-3.5 w-3.5 mr-1" />
                            Assign Student
                          </Button>
                        )}

                        {sys.status === "ASSIGNED" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUnassign(sys.id)}
                              className="text-destructive hover:bg-destructive/10"
                            >
                              Unassign
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleStartQuiz(sys.id, sys.systemNumber)}
                              className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                            >
                              <Play className="h-3.5 w-3.5 mr-1" />
                              Start Quiz
                            </Button>
                          </>
                        )}

                        {(sys.status === "ATTEMPTING" || sys.status === "IN_PROGRESS") && (
                          <span className="text-xs text-blue-600 font-semibold animate-pulse">Attempting Exam...</span>
                        )}

                        {sys.status === "COMPLETED" && (
                          <span className="text-xs text-green-600 font-semibold">Submitted</span>
                        )}

                        {sys.status === "BLOCKED" && (
                          <span className="text-xs text-destructive font-semibold">Blocked</span>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteSystem(sys.id, sys.systemNumber)}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                          title="Remove System"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* ── BLOCKED MEMBERS RIGHT SIDEBAR SHEET PANEL ── */}
      <Sheet open={blockedSidebarOpen} onOpenChange={setBlockedSidebarOpen}>
        <SheetContent side="right" className="sm:max-w-md w-full p-0 flex h-dvh max-h-screen flex-col overflow-hidden bg-card">
          <div className="shrink-0 border-b bg-muted/20">
            <SheetHeader className="p-4">
              <div className="flex items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-destructive" />
                  <SheetTitle className="text-base font-bold">Blocked Members Panel</SheetTitle>
                </div>
                <Badge variant="destructive" className="text-xs px-2 font-bold">
                  {blockedCount} Total
                </Badge>
              </div>
              <SheetDescription className="text-xs mt-1">
                Real-time candidates blocked by proctoring rules. Click any member to view full violation logs or unblock.
              </SheetDescription>
            </SheetHeader>
          </div>

          {/* Scrollable Blocked List Container with Lenis Prevent */}
          <div 
            data-lenis-prevent 
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-3"
            onWheel={(e) => e.stopPropagation()}
            onTouchMoveCapture={(e) => e.stopPropagation()}
          >
            {blockedMembers.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground space-y-2">
                <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto opacity-80" />
                <p className="font-semibold text-sm text-foreground">No Blocked Members</p>
                <p className="text-xs">All candidates are following proctoring rules cleanly.</p>
              </div>
            ) : (
              blockedMembers.map((member) => (
                <div
                  key={member.id}
                  onClick={() => setSelectedBlockedMember(member)}
                  className="p-3.5 rounded-lg border bg-card hover:border-destructive cursor-pointer transition-all space-y-2 group shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-sm group-hover:text-destructive transition-colors truncate">
                        {member.name}
                      </p>
                      {member.email && (
                        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                      )}
                      {member.systemNumber && (
                        <Badge variant="outline" className="text-[10px] font-mono mt-1">
                          System: {member.systemNumber}
                        </Badge>
                      )}
                    </div>
                    <Badge variant="destructive" className="text-xs shrink-0 font-bold">
                      {member.violationCount || 1} Violation{(member.violationCount || 1) > 1 ? "s" : ""}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <span className="font-mono text-destructive font-semibold uppercase text-[11px]">
                      {member.violationType || "SECURITY_BLOCK"}
                    </span>
                    <span className="text-[11px]">{new Date(member.blockedAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Assign Student Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-md rounded-xl border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Assign Student to {selectedSystem?.systemNumber}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Assign a participant from form responses or enter details manually.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Response ID Input & Auto-Fetch */}
            <div className="space-y-2 p-3 rounded-lg border bg-muted/30">
              <label className="text-xs font-semibold flex items-center justify-between">
                <span>Auto-Fetch Student by Response ID</span>
                {isFetchingResponse && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Paste Response ID..."
                  value={selectedResponseId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedResponseId(val);
                    if (val.trim().length >= 5) {
                      handleFetchByResponseId(val.trim());
                    }
                  }}
                  className="font-mono text-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleFetchByResponseId(selectedResponseId)}
                  disabled={isFetchingResponse || !selectedResponseId.trim()}
                >
                  {isFetchingResponse ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                </Button>
              </div>

              {fetchedNotice && (
                <div className="text-xs font-medium text-green-600 flex items-center gap-1.5 pt-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{fetchedNotice}</span>
                </div>
              )}
            </div>

            {/* Form Response Picker Dropdown (If Linked Form Exists) */}
            {formResponses.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">
                  Or Pick from Linked Form Responses
                </label>
                <Select
                  value={selectedResponseId}
                  onValueChange={(val) => {
                    setSelectedResponseId(val);
                    if (val !== "custom") {
                      handleFetchByResponseId(val);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose form response..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">-- Custom / Manual Entry --</SelectItem>
                    {formResponses.map((r) => {
                      const alreadySys = systems.find(
                        (s) => s.id !== selectedSystem?.id && (
                          s.assignedResponseId === r.id ||
                          (s.assignedStudentEmail && r.submittedByEmail && s.assignedStudentEmail.toLowerCase() === r.submittedByEmail.toLowerCase())
                        )
                      );
                      return (
                        <SelectItem key={r.id} value={r.id} disabled={!!alreadySys}>
                          {r.submittedByName || "Unnamed"} ({r.submittedByEmail || r.id}) {alreadySys ? `[Assigned: ${alreadySys.systemNumber}]` : ""}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Duplicate Assignment Warning Banner */}
            {(() => {
              const duplicateSys = systems.find(
                (s) => s.id !== selectedSystem?.id && (
                  (s.assignedResponseId && selectedResponseId && selectedResponseId !== "custom" && s.assignedResponseId === selectedResponseId) ||
                  (s.assignedStudentEmail && customEmail && s.assignedStudentEmail.toLowerCase() === customEmail.trim().toLowerCase())
                )
              );
              if (duplicateSys) {
                return (
                  <div className="text-xs p-2.5 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>
                      <strong>Candidate Already Assigned:</strong> This participant is already assigned to {duplicateSys.systemNumber}. They cannot be assigned again.
                    </span>
                  </div>
                );
              }
              return null;
            })()}

            {/* Auto-filled Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Participant Full Name *</label>
              <Input
                placeholder="e.g., Rahul Kumar Sharma"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
              />
            </div>

            {/* Auto-filled Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Participant Email Address *</label>
              <Input
                type="email"
                placeholder="e.g., rahul@gmail.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
              />
            </div>

            {/* Set Selection */}
            {sets > 1 && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Assigned Question Set</label>
                <Select value={assignedSet} onValueChange={setAssignedSet}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Set" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: sets }, (_, i) => {
                      const setLetter = String.fromCharCode(65 + i);
                      return (
                        <SelectItem key={setLetter} value={setLetter}>
                          Set {setLetter}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignStudent}>
                Assign & Sync
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Blocked Member Details Modal */}
      <Dialog open={!!selectedBlockedMember} onOpenChange={(open) => !open && setSelectedBlockedMember(null)}>
        <DialogContent className="max-w-md rounded-xl border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-5 w-5" />
              Blocked Candidate Violation Report
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Detailed proctoring violation record for this candidate
            </DialogDescription>
          </DialogHeader>

          {selectedBlockedMember && (
            <div className="space-y-4 pt-2">
              <div className="p-3 bg-muted/40 rounded-lg space-y-2 border">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="font-bold text-sm">{selectedBlockedMember.name}</p>
                    {selectedBlockedMember.email && (
                      <p className="text-xs text-muted-foreground font-mono">{selectedBlockedMember.email}</p>
                    )}
                  </div>
                </div>
                {selectedBlockedMember.systemNumber && (
                  <Badge variant="outline" className="text-xs">
                    Kiosk {selectedBlockedMember.systemNumber}
                  </Badge>
                )}
              </div>

              <Separator />

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Violation Type:</span>
                  <Badge variant="destructive" className="font-mono text-[10px]">
                    {selectedBlockedMember.violationType || "SECURITY_BLOCK"}
                  </Badge>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Violation Count:</span>
                  <span className="font-bold">{selectedBlockedMember.violationCount || 1}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Time Blocked:</span>
                  <span>{new Date(selectedBlockedMember.blockedAt).toLocaleString()}</span>
                </div>
                <div className="space-y-1 pt-1">
                  <span className="text-muted-foreground font-medium">Block Reason:</span>
                  <p className="p-2 bg-destructive/10 border border-destructive/20 rounded text-destructive font-medium leading-relaxed">
                    {selectedBlockedMember.reason || "Automatic proctoring violation limit reached."}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t gap-3">
                <Button variant="outline" size="sm" onClick={() => setSelectedBlockedMember(null)}>
                  Close
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleUnblockMember(selectedBlockedMember.userId)}
                  disabled={isUnblocking}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                >
                  {isUnblocking ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Unlock className="h-4 w-4 mr-1.5" />}
                  Unblock Candidate
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
