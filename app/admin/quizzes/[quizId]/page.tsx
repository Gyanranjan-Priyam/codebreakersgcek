import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, Clock, Calendar, CheckCircle2, Globe, Users, Monitor, BarChart3, BookOpen, Layers, HelpCircle, Award } from "lucide-react";
import Link from "next/link";
import { getQuizByQuizId } from "../actions";
import { notFound } from "next/navigation";
import { ExportQuizPDF } from "./_components/ExportQuizPDF";
import { ExternalSystemPanel } from "./_components/external-system-panel";
import { prisma } from "@/lib/db";
import CopyCodeButton from "./_components/copy-code-button";

export default async function QuizDetailsPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params;
  const result = await getQuizByQuizId(quizId);

  if (result.status === "error" || !result.data) {
    notFound();
  }

  const quiz = result.data;
  let questionsData: any = {};

  try {
    questionsData = JSON.parse(quiz.questionsJson);
  } catch (error) {
    console.error("Error parsing questions:", error);
  }

  let totalQuestions = 0;
  if (typeof questionsData === "object" && !Array.isArray(questionsData)) {
    totalQuestions = Object.values(questionsData).reduce((sum: number, questions: any) => sum + questions.length, 0);
  } else if (Array.isArray(questionsData)) {
    totalQuestions = questionsData.length;
  }

  // Fetch form responses if linked form exists
  let formResponses: Array<{ id: string; submittedByName?: string; submittedByEmail?: string }> = [];
  if (quiz.formId) {
    try {
      const rawResponses = await prisma.formResponse.findMany({
        where: { formId: quiz.formId },
        select: { id: true, answers: true },
        orderBy: { createdAt: "desc" },
      });

      formResponses = rawResponses.map((r) => {
        const answersObj = (r.answers || {}) as Record<string, unknown>;
        let submittedByName = "";
        let submittedByEmail = "";
        for (const [k, v] of Object.entries(answersObj)) {
          if (typeof v === "string") {
            const val = v.trim();
            const key = k.toLowerCase();
            if (!submittedByEmail && (key.includes("email") || (val.includes("@") && val.includes(".")))) {
              submittedByEmail = val;
            }
            if (!submittedByName && key.includes("name") && val) {
              submittedByName = val;
            }
          }
        }
        return { id: r.id, submittedByName: submittedByName || `Response ${r.id.slice(0, 6)}`, submittedByEmail };
      });
    } catch (e) {
      console.error("Error loading form responses:", e);
    }
  }

  let shiftsData: Array<{ shiftNumber: number; name: string; set?: string; sets?: string[]; status?: string }> = [];
  try {
    if (quiz.shiftsJson) {
      shiftsData = JSON.parse(quiz.shiftsJson);
    }
  } catch (e) {
    console.error("Error parsing shiftsJson:", e);
  }
  if (shiftsData.length === 0) {
    const totalShifts = quiz.shifts || 1;
    for (let i = 1; i <= totalShifts; i++) {
      const defaultSet = String.fromCharCode(65 + ((i - 1) % (quiz.sets || 1)));
      shiftsData.push({
        shiftNumber: i,
        name: `Shift ${i}`,
        set: defaultSet,
        sets: [defaultSet],
        status: i < (quiz.activeShift || 1) ? "COMPLETED" : i === (quiz.activeShift || 1) ? "ACTIVE" : "PENDING",
      });
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-8xl mx-auto w-full">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{quiz.title}</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              View configuration, questions, and manage candidate systems
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/quizzes/results/${quiz.quizId}`}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Results
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/quizzes/edit/${quiz.id}`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Quiz
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={`/admin/quizzes/${quiz.quizId}/systems`}>
              <Monitor className="h-4 w-4 mr-2" />
              Manage Systems
            </Link>
          </Button>
        </div>
      </div>

      {/* Quiz Details Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              {quiz.title}
            </CardTitle>
            <CardDescription className="font-mono text-xs">
              Quiz ID: {quiz.quizId}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={quiz.targetAudience === "EXTERNAL" ? "secondary" : "outline"}>
                {quiz.targetAudience === "EXTERNAL" ? (
                  <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> External</span>
                ) : (
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> Internal</span>
                )}
              </Badge>
              <Badge variant={quiz.isActive ? "default" : "secondary"}>
                {quiz.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
              <Layers className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Question Sets</p>
                <p className="text-xl font-bold">{quiz.sets}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
              <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Total Questions</p>
                <p className="text-xl font-bold">{totalQuestions}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
              <Award className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Points / Question</p>
                <p className="text-xl font-bold">{quiz.pointsPerQuestion}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="text-xl font-bold">{quiz.duration}<span className="text-xs font-normal ml-1">min</span></p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm font-semibold">{new Date(quiz.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Shifts and Question Sets Mapping pills */}
          {shiftsData.length > 0 && quiz.targetAudience === "EXTERNAL" && (
            <div className="p-3.5 border rounded-lg bg-muted/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Multi-Shift Setup ({shiftsData.length} Shifts · Active: Shift {quiz.activeShift || 1})
                </span>
                <Badge variant="outline" className="text-xs font-mono">
                  Current Active: Shift {quiz.activeShift || 1}
                </Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {shiftsData.map((shift) => {
                  const isActive = (quiz.activeShift || 1) === shift.shiftNumber;
                  const isCompleted = shift.status === "COMPLETED";
                  const shiftSets = shift.sets && shift.sets.length > 0 ? shift.sets : [shift.set || "A"];
                  return (
                    <div
                      key={shift.shiftNumber}
                      className={`p-2.5 rounded-lg border text-center transition-all ${
                        isActive
                          ? "border-primary bg-primary/5 text-primary font-semibold shadow-xs"
                          : isCompleted
                          ? "border-green-600/40 bg-green-500/5 text-green-700 dark:text-green-400"
                          : "border-border/60 bg-card text-muted-foreground"
                      }`}
                    >
                      <div className="text-xs font-bold">{shift.name || `Shift ${shift.shiftNumber}`}</div>
                      <div className="text-[11px] font-mono mt-0.5">
                        {shiftSets.length > 1 ? `Sets: ${shiftSets.join(", ")}` : `Set ${shiftSets[0]}`}
                      </div>
                      <div className="text-[10px] mt-1 opacity-80">
                        {isCompleted ? "✓ Done" : isActive ? "● Active" : "Pending"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <Separator />

          {/* Description */}
          <div>
            <h3 className="text-sm font-medium mb-2">Description / Rules</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{quiz.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* External Real-Time System Panel */}
      {quiz.targetAudience === "EXTERNAL" && (
        <ExternalSystemPanel
          quizId={quiz.id}
          accessCode={quiz.accessCode}
          sets={quiz.sets}
          shifts={quiz.shifts || 1}
          shiftsJson={quiz.shiftsJson || null}
          activeShift={quiz.activeShift || 1}
          formId={quiz.formId}
          formResponses={formResponses}
        />
      )}

      {/* Questions by Set */}
      {typeof questionsData === "object" && !Array.isArray(questionsData) ? (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="text-lg">Questions by Set</CardTitle>
                <CardDescription>Click a set to review its questions</CardDescription>
              </div>
              <ExportQuizPDF
                quizTitle={quiz.title}
                quizId={quiz.quizId}
                description={quiz.description}
                duration={quiz.duration}
                questions={Object.values(questionsData).flat() as any[]}
                questionsBySet={questionsData}
              />
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {Object.keys(questionsData).sort().map((setKey) => (
                <AccordionItem key={setKey} value={`set-${setKey}`}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">Set {setKey}</span>
                        <Badge variant="outline">
                          {questionsData[setKey].length} question{questionsData[setKey].length > 1 ? "s" : ""}
                        </Badge>
                      </div>
                      <ExportQuizPDF
                        quizTitle={quiz.title}
                        quizId={quiz.quizId}
                        description={quiz.description}
                        duration={quiz.duration}
                        setNumber={setKey}
                        questions={questionsData[setKey] as any[]}
                        size="sm"
                        stopPropagation
                      />
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-3">
                      {questionsData[setKey].map((question: any, index: number) => (
                        <Card key={index} className="bg-muted/40">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-start gap-3">
                                <Badge variant="outline" className="mt-0.5 shrink-0">Q{question.id}</Badge>
                                <p className="font-medium flex-1 text-sm">{question.question}</p>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-10">
                                {question.options.map((opt: string, i: number) => (
                                  <div
                                    key={i}
                                    className={`p-2 rounded-lg border text-sm ${
                                      opt === question.answer
                                        ? "border-primary bg-primary/10"
                                        : "border-border bg-background"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Badge variant={opt === question.answer ? "default" : "outline"} className="text-xs h-5 px-1.5">
                                        {String.fromCharCode(65 + i)}
                                      </Badge>
                                      <span className="flex-1">{opt}</span>
                                      {opt === question.answer && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="ml-10 text-xs text-muted-foreground">
                                Correct: <span className="font-medium text-primary">{question.answer}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      ) : Array.isArray(questionsData) ? (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="text-lg">Questions</CardTitle>
                <CardDescription>{questionsData.length} total questions</CardDescription>
              </div>
              <ExportQuizPDF
                quizTitle={quiz.title}
                quizId={quiz.quizId}
                description={quiz.description}
                duration={quiz.duration}
                questions={questionsData as any[]}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {questionsData.map((question: any, index: number) => (
                <Card key={index} className="bg-muted/40">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="mt-0.5 shrink-0">Q{question.id}</Badge>
                        <p className="font-medium flex-1 text-sm">{question.question}</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-10">
                        {question.options.map((opt: string, i: number) => (
                          <div key={i} className={`p-2 rounded-lg border text-sm ${opt === question.answer ? "border-primary bg-primary/10" : "border-border bg-background"}`}>
                            <div className="flex items-center gap-2">
                              <Badge variant={opt === question.answer ? "default" : "outline"} className="text-xs h-5 px-1.5">{String.fromCharCode(65 + i)}</Badge>
                              <span className="flex-1">{opt}</span>
                              {opt === question.answer && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="ml-10 text-xs text-muted-foreground">
                        Correct: <span className="font-medium text-primary">{question.answer}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
