"use client";

import { useState, useEffect, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  getExternalSystems,
  assignStudentToSystem,
  unassignStudentFromSystem,
  startSystemQuiz,
  startAllSystems,
  getStudentDetailsByResponseId,
} from "@/app/admin/quizzes/actions";
import {
  Monitor,
  RefreshCw,
  Clock,
  CheckCircle2,
  User,
  AlertTriangle,
  Search,
  Loader2,
  Mail,
  Play,
  UserX,
  UserCheck,
} from "lucide-react";
import CopyCodeButton from "../../_components/copy-code-button";

interface System {
  id: string;
  systemCode: string;
  systemNumber: string;
  status: string;
  assignedResponseId?: string | null;
  assignedStudentName: string | null;
  assignedStudentEmail: string | null;
  assignedSet: string | null;
  createdAt?: string | Date | null;
  completedAt?: string | Date | null;
}

interface FormResponse {
  id: string;
  submittedByName?: string;
  submittedByEmail?: string;
}

interface SystemsManagementViewProps {
  quizId: string;
  quizSlug: string;
  quizTitle: string;
  accessCode: string | null;
  sets: number;
  formId: string | null;
  initialSystems: System[];
  formResponses: FormResponse[];
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  REGISTERED: { label: "Registered", variant: "outline" },
  ASSIGNED: { label: "Assigned", variant: "secondary" },
  IN_PROGRESS: { label: "In Progress", variant: "default" },
  COMPLETED: { label: "Completed", variant: "secondary" },
};

export default function SystemsManagementView({
  quizId,
  quizSlug,
  quizTitle,
  accessCode,
  sets,
  formId,
  initialSystems,
  formResponses = [],
}: SystemsManagementViewProps) {
  const [systems, setSystems] = useState<System[]>(initialSystems);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isPending, startTransition] = useTransition();

  // Sidebar Assign Form State
  const [selectedSystemCode, setSelectedSystemCode] = useState<string>("");
  const [responseId, setResponseId] = useState<string>("");
  const [studentName, setStudentName] = useState<string>("");
  const [studentEmail, setStudentEmail] = useState<string>("");
  const [selectedSet, setSelectedSet] = useState<string>("A");
  const [isFetchingResponse, setIsFetchingResponse] = useState(false);
  const [isSubmittingAssign, setIsSubmittingAssign] = useState(false);

  const sortSystemsNaturally = (list: System[]) => {
    return [...list].sort((a, b) =>
      a.systemNumber.localeCompare(b.systemNumber, undefined, { numeric: true, sensitivity: "base" })
    );
  };

  const sortedSystems = sortSystemsNaturally(systems);

  // Poll systems list every 3 seconds for real-time updates
  const refreshSystems = () => {
    startTransition(async () => {
      const res = await getExternalSystems(quizId);
      if (res.status === "success" && res.data) {
        const sortedData = (res.data as System[]).sort((a, b) =>
          a.systemNumber.localeCompare(b.systemNumber, undefined, { numeric: true, sensitivity: "base" })
        );
        setSystems(sortedData);
        setLastUpdated(new Date());
      }
    });
  };

  useEffect(() => {
    const timer = setInterval(refreshSystems, 3000);
    return () => clearInterval(timer);
  }, [quizId]);

  // Select system for assignment (from sidebar dropdown or clicking row "Assign")
  const handleSelectSystem = (systemCode: string) => {
    setSelectedSystemCode(systemCode);
    const sorted = sortSystemsNaturally(systems);
    const idx = sorted.findIndex((s) => s.systemCode === systemCode);
    const found = sorted[idx];
    if (found) {
      if (found.assignedStudentName) setStudentName(found.assignedStudentName);
      else setStudentName("");
      if (found.assignedStudentEmail) setStudentEmail(found.assignedStudentEmail);
      else setStudentEmail("");
      
      const autoSet = String.fromCharCode(65 + ((idx >= 0 ? idx : 0) % (sets || 1)));
      setSelectedSet(found.assignedSet || autoSet);
    }
  };

  // Auto-fetch student by Response ID
  const handleFetchStudent = async () => {
    if (!responseId.trim()) {
      toast.error("Enter a Response ID first");
      return;
    }
    setIsFetchingResponse(true);
    const res = await getStudentDetailsByResponseId(responseId.trim());
    if (res.status === "success" && res.data) {
      setStudentName(res.data.studentName || (res.data as any).name || "");
      setStudentEmail(res.data.studentEmail || (res.data as any).email || "");
      toast.success("Student details auto-fetched!");
    } else {
      toast.error(res.message || "Response not found");
    }
    setIsFetchingResponse(false);
  };

  // Assign Student
  const handleAssignStudent = async () => {
    if (!selectedSystemCode) {
      toast.error("Please select a registered system");
      return;
    }
    if (!studentName.trim()) {
      toast.error("Student name is required");
      return;
    }
    if (!studentEmail.trim()) {
      toast.error("Student email is required");
      return;
    }

    setIsSubmittingAssign(true);
    const res = await assignStudentToSystem({
      systemCode: selectedSystemCode,
      formResponseId: responseId.trim() || undefined,
      studentName: studentName.trim(),
      studentEmail: studentEmail.trim(),
      assignedSet: selectedSet,
    });

    if (res.status === "success") {
      toast.success("Student assigned to system successfully!");
      refreshSystems();
    } else {
      toast.error(res.message || "Failed to assign student");
    }
    setIsSubmittingAssign(false);
  };

  // Unassign Student
  const handleUnassign = async (systemId: string) => {
    const res = await unassignStudentFromSystem(systemId);
    if (res.status === "success") {
      toast.info("Student unassigned");
      refreshSystems();
      if (selectedSystemCode && systems.find((s) => s.id === systemId)?.systemCode === selectedSystemCode) {
        setStudentName("");
        setStudentEmail("");
      }
    } else {
      toast.error(res.message || "Failed to unassign");
    }
  };

  const [isStartingAll, setIsStartingAll] = useState(false);

  // Start Quiz for single system
  const handleStartQuiz = async (systemId: string) => {
    const res = await startSystemQuiz(systemId);
    if (res.status === "success") {
      toast.success("Quiz started for system!");
      refreshSystems();
    } else {
      toast.error(res.message || "Failed to start quiz");
    }
  };

  // Start Quiz for all assigned systems at the same time
  const handleStartAllSystems = async () => {
    if (assignedCount === 0) {
      toast.error("No assigned systems ready to start");
      return;
    }

    setIsStartingAll(true);
    const res = await startAllSystems(quizId);
    if (res.status === "success") {
      toast.success(`Successfully started quiz for all ${assignedCount} assigned systems simultaneously!`);
      refreshSystems();
    } else {
      toast.error(res.message || "Failed to start all systems");
    }
    setIsStartingAll(false);
  };

  const selectedSystem = systems.find((s) => s.systemCode === selectedSystemCode);
  const registeredCount = systems.length;
  const assignedCount = systems.filter((s) => s.status === "ASSIGNED").length;
  const inProgressCount = systems.filter((s) => s.status === "IN_PROGRESS").length;
  const completedCount = systems.filter((s) => s.status === "COMPLETED").length;

  return (
    <div className="space-y-6">
      {/* Metrics Summary Bar */}
      <Card>
        <CardContent className="p-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <p className="text-xs text-muted-foreground">Access Code</p>
              <p className="text-2xl font-mono font-bold tracking-widest">{accessCode || "N/A"}</p>
            </div>
            <div className="h-8 w-px bg-border hidden sm:block" />
            <div>
              <p className="text-xs text-muted-foreground">Registered Kiosks</p>
              <p className="text-2xl font-bold">{registeredCount}</p>
            </div>
            <div className="h-8 w-px bg-border hidden sm:block" />
            <div>
              <p className="text-xs text-muted-foreground">Assigned Candidates</p>
              <p className="text-2xl font-bold text-primary">{assignedCount}</p>
            </div>
            <div className="h-8 w-px bg-border hidden sm:block" />
            <div>
              <p className="text-xs text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold">{inProgressCount}</p>
            </div>
            <div className="h-8 w-px bg-border hidden sm:block" />
            <div>
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-green-600">{completedCount}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            {accessCode && <CopyCodeButton code={accessCode} />}
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold cursor-pointer"
              onClick={handleStartAllSystems}
              disabled={isStartingAll || assignedCount === 0}
            >
              {isStartingAll ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5 mr-1.5" />
              )}
              Start Quiz for All Systems ({assignedCount})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid: Left Systems List, Right Student Assign Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
        
        {/* ── LEFT COLUMN: REGISTERED SYSTEMS LIST ── */}
        <div className="space-y-4 min-w-0">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Registered Systems List
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Real-time status updates · Auto-refreshes every 3s · Last: {lastUpdated.toLocaleTimeString()}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={refreshSystems} disabled={isPending}>
                  <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {systems.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed rounded-lg space-y-2">
                  <Monitor className="h-10 w-10 text-muted-foreground mx-auto" />
                  <h3 className="font-semibold text-base">No systems registered yet</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Tell candidates or kiosk operators to navigate to <strong>/quiz/system-register</strong> and enter access code <strong>{accessCode}</strong>.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedSystems.map((system) => {
                    const cfg = statusConfig[system.status] || { label: system.status, variant: "outline" as const };
                    const isSelected = system.systemCode === selectedSystemCode;

                    return (
                      <div
                        key={system.id}
                        className={`p-4 rounded-lg border-2 transition-all space-y-3 ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-border/80 bg-card"
                        }`}
                      >
                        {/* Header info */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-md bg-muted shrink-0">
                              <Monitor className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-base">{system.systemNumber}</span>
                                <span className="font-mono text-xs text-muted-foreground">({system.systemCode})</span>
                              </div>
                            </div>
                          </div>
                          <Badge variant={cfg.variant} className="text-xs font-semibold">
                            {cfg.label}
                          </Badge>
                        </div>

                        {/* Candidate info */}
                        {system.assignedStudentName ? (
                          <div className="p-2.5 bg-muted/50 rounded-md flex items-center justify-between text-xs gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <div className="truncate">
                                <span className="font-semibold">{system.assignedStudentName}</span>
                                <span className="text-muted-foreground ml-1 font-mono">({system.assignedStudentEmail})</span>
                              </div>
                            </div>
                            {system.assignedSet && (
                              <Badge variant="outline" className="text-[10px] shrink-0 font-bold">
                                Set {system.assignedSet}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">No student assigned to this kiosk</p>
                        )}

                        {/* Actions row */}
                        <div className="flex items-center gap-2 pt-1 flex-wrap">
                          {system.status === "REGISTERED" || system.status === "ASSIGNED" ? (
                            <Button
                              size="sm"
                              variant={isSelected ? "default" : "outline"}
                              onClick={() => handleSelectSystem(system.systemCode)}
                              className="text-xs cursor-pointer"
                            >
                              <UserCheck className="h-3.5 w-3.5 mr-1.5" />
                              {system.assignedStudentName ? "Edit Assignment" : "Assign Student"}
                            </Button>
                          ) : null}

                          {system.status === "ASSIGNED" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white text-xs cursor-pointer"
                                onClick={() => handleStartQuiz(system.id)}
                              >
                                <Play className="h-3.5 w-3.5 mr-1" />
                                Start Exam
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:bg-destructive/10 text-xs cursor-pointer"
                                onClick={() => handleUnassign(system.id)}
                              >
                                <UserX className="h-3.5 w-3.5 mr-1" />
                                Unassign
                              </Button>
                            </>
                          )}

                          {system.status === "IN_PROGRESS" && (
                            <div className="flex items-center gap-1.5 text-xs text-primary font-semibold">
                              <Clock className="h-3.5 w-3.5 animate-pulse" />
                              Exam in progress...
                            </div>
                          )}

                          {system.status === "COMPLETED" && (
                            <div className="flex items-center gap-1.5 text-xs text-green-600 font-semibold">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Exam completed
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── RIGHT COLUMN: STUDENT ASSIGNMENT SIDEBAR ── */}
        <div className="sticky top-6 self-start space-y-4">
          <Card className="max-h-[calc(100vh-3rem)] flex flex-col border-2 border-border shadow-md">
            <CardHeader className="pb-3 border-b shrink-0 bg-muted/20">
              <CardTitle className="text-base flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-primary" />
                Assign Student Sidebar
              </CardTitle>
              <CardDescription className="text-xs">
                Select a kiosk and assign candidate details in real-time
              </CardDescription>
            </CardHeader>

            {/* Scrollable Form Body */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-8rem)]">
              
              {/* Step 1: Select Kiosk System */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Select Kiosk System *</Label>
                <Select value={selectedSystemCode} onValueChange={handleSelectSystem}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="-- Select Kiosk System --" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortedSystems.map((s) => (
                      <SelectItem key={s.systemCode} value={s.systemCode} className="text-xs">
                        {s.systemNumber} ({s.systemCode}) — {s.status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedSystem && (
                  <p className="text-[11px] text-muted-foreground">
                    Selected: <strong>{selectedSystem.systemNumber}</strong> ({selectedSystem.systemCode})
                  </p>
                )}
              </div>

              <Separator />

              {/* Step 2: Auto-Fetch via Response ID (if linked form exists) */}
              {formId && (
                <div className="space-y-2 p-3 bg-muted/40 rounded-lg border text-xs space-y-2">
                  <Label className="text-xs font-semibold flex items-center gap-1">
                    <Search className="h-3.5 w-3.5 text-primary" />
                    Auto-fetch by Response ID
                  </Label>
                  <div className="flex gap-1.5">
                    <Input
                      placeholder="Paste Response ID..."
                      value={responseId}
                      onChange={(e) => setResponseId(e.target.value)}
                      className="h-8 text-xs font-mono"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={handleFetchStudent}
                      disabled={isFetchingResponse}
                      className="h-8 px-2"
                    >
                      {isFetchingResponse ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Fetch"}
                    </Button>
                  </div>

                  {/* Form response quick picker */}
                  {formResponses.length > 0 && (
                    <div className="space-y-1 mt-2">
                      <p className="text-[10px] text-muted-foreground font-medium">Or pick from form responses:</p>
                      <div className="max-h-28 overflow-y-auto space-y-1 border rounded bg-background p-1">
                        {formResponses.map((r) => {
                          const alreadySys = systems.find(
                            (s) => s.assignedResponseId === r.id ||
                            (s.assignedStudentEmail && r.submittedByEmail && s.assignedStudentEmail.toLowerCase() === r.submittedByEmail.toLowerCase())
                          );
                          return (
                            <button
                              key={r.id}
                              type="button"
                              disabled={!!alreadySys}
                              className={`w-full flex items-center justify-between text-[11px] p-1.5 rounded text-left transition-colors ${
                                alreadySys
                                  ? "opacity-40 cursor-not-allowed bg-muted/30"
                                  : "hover:bg-muted cursor-pointer"
                              }`}
                              onClick={() => {
                                if (alreadySys) return;
                                setResponseId(r.id);
                                setStudentName(r.submittedByName || "");
                                setStudentEmail(r.submittedByEmail || "");
                                toast.info(`Selected: ${r.submittedByName || r.id.slice(0, 6)}`);
                              }}
                            >
                              <span className="font-medium truncate max-w-[180px]">
                                {r.submittedByName || `Response ${r.id.slice(0, 6)}`} {alreadySys ? `(Assigned: ${alreadySys.systemNumber})` : ""}
                              </span>
                              <span className="font-mono text-[10px] text-muted-foreground shrink-0">
                                {r.id.slice(0, 6)}...
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Candidate Name & Email */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Student Full Name *</Label>
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <Input
                      placeholder="e.g. John Doe"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Student Email Address *</Label>
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <Input
                      placeholder="e.g. john@example.com"
                      type="email"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Step 4: Assigned Set */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Assign Question Set *</Label>
                <Select value={selectedSet} onValueChange={setSelectedSet}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: sets }, (_, i) => {
                      const letter = String.fromCharCode(65 + i);
                      return (
                        <SelectItem key={letter} value={letter} className="text-xs">
                          Set {letter}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Preview Box */}
              {studentName && studentEmail && (
                <Alert className="p-2.5 bg-primary/5 border-primary/30 text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                  <AlertDescription className="text-xs">
                    <strong>{studentName}</strong> ({studentEmail}) — Set {selectedSet}
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Submit Buttons */}
              <div className="pt-2 space-y-2">
                <Button
                  onClick={handleAssignStudent}
                  disabled={isSubmittingAssign || !selectedSystemCode || !studentName || !studentEmail}
                  className="w-full text-xs font-bold h-9 cursor-pointer"
                >
                  {isSubmittingAssign && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                  Assign Candidate to System
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedSystemCode("");
                    setResponseId("");
                    setStudentName("");
                    setStudentEmail("");
                  }}
                  className="w-full text-[11px] text-muted-foreground h-7"
                >
                  Reset Form
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
