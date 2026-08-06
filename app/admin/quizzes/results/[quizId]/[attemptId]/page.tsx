import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Mail, Calendar, CheckCircle2, XCircle, Award, Clock } from "lucide-react";
import Link from "next/link";
import { PublishResultButton } from "../_components/publish-result-button";

export default async function StudentResultDetailPage({
  params,
}: {
  params: Promise<{ quizId: string; attemptId: string }>;
}) {
  const { quizId, attemptId } = await params;

  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: true,
    },
  });

  if (!attempt) {
    notFound();
  }

  // Get student details (internal vs external)
  let studentName = attempt.participantName || "Participant";
  let studentEmail = attempt.participantEmail || "N/A";

  if (!attempt.participantName && attempt.userId && !attempt.userId.startsWith("ext_")) {
    const user = await prisma.user.findUnique({
      where: { id: attempt.userId },
      select: { name: true, email: true },
    });
    if (user) {
      studentName = user.name;
      studentEmail = user.email;
    }
  }

  // Parse questions & student answers
  let answersObj: Record<string, string> = {};
  try {
    answersObj = JSON.parse(attempt.answersJson || "{}");
  } catch (e) {
    console.error(e);
  }

  let questionsData: any = {};
  try {
    questionsData = JSON.parse(attempt.quiz.questionsJson);
  } catch (e) {
    console.error(e);
  }

  let questionsList: any[] = [];
  const setLetter = String.fromCharCode(64 + attempt.setNumber);

  if (typeof questionsData === "object" && !Array.isArray(questionsData)) {
    questionsList = questionsData[setLetter] || questionsData["A"] || [];
  } else if (Array.isArray(questionsData)) {
    questionsList = questionsData;
  }

  const isPassed = attempt.score >= 50;

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8 max-w-5xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="rounded-xl" asChild>
            <Link href={`/admin/quizzes/results/${attempt.quiz.quizId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Student Result: {studentName}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Detailed performance breakdown & email publication
            </p>
          </div>
        </div>

        <PublishResultButton
          attemptId={attempt.id}
          isPublished={attempt.isPublished}
          publishedAt={attempt.publishedAt}
        />
      </div>

      {/* Student Details Card */}
      <Card className="rounded-2xl border-border/60 shadow-lg">
        <CardHeader className="border-b border-border/40 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <span>{studentName}</span>
              </CardTitle>
              <CardDescription className="text-xs mt-1 flex items-center gap-1.5 font-mono">
                <Mail className="h-3.5 w-3.5" />
                {studentEmail}
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">
                Set {setLetter}
              </Badge>
              <Badge variant={attempt.isPublished ? "default" : "secondary"}>
                {attempt.isPublished ? "Result Published" : "Draft / Pending Release"}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-xl border border-border/60 bg-card/40">
              <div className="text-xs text-muted-foreground font-semibold uppercase">Percentage Score</div>
              <div className={`text-3xl font-black mt-1 ${isPassed ? "text-emerald-500" : "text-destructive"}`}>
                {attempt.score.toFixed(1)}%
              </div>
              <div className="mt-1">
                <Badge variant={isPassed ? "default" : "destructive"} className="text-xs">
                  {isPassed ? "Passed" : "Needs Improvement"}
                </Badge>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border/60 bg-card/40">
              <div className="text-xs text-muted-foreground font-semibold uppercase">Correct Answers</div>
              <div className="text-3xl font-black mt-1">
                {attempt.correctAnswers} / {attempt.totalQuestions}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Total questions</div>
            </div>

            <div className="p-4 rounded-xl border border-border/60 bg-card/40">
              <div className="text-xs text-muted-foreground font-semibold uppercase">Points Awarded</div>
              <div className="text-3xl font-black text-amber-500 mt-1">{attempt.pointsEarned}</div>
              <div className="text-xs text-muted-foreground mt-1">Points</div>
            </div>

            <div className="p-4 rounded-xl border border-border/60 bg-card/40">
              <div className="text-xs text-muted-foreground font-semibold uppercase">Submission Date</div>
              <div className="text-sm font-bold mt-2">
                {new Date(attempt.createdAt).toLocaleDateString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {new Date(attempt.createdAt).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Response Breakdown */}
      <Card className="rounded-2xl border-border/60 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Question-by-Question Answers</CardTitle>
          <CardDescription className="text-xs">
            Review full participant choices vs correct answer keys
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {questionsList.map((q: any, idx: number) => {
            const userAns = (answersObj[q.id.toString()] || "").toString().trim();
            const correctAns = (q.answer || "").toString().trim();
            const isCorrect = userAns === correctAns;

            return (
              <Card
                key={idx}
                className={`p-5 rounded-2xl border-2 transition-all ${
                  isCorrect ? "border-emerald-500/30 bg-emerald-500/5" : "border-destructive/30 bg-destructive/5"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="font-mono mt-0.5">
                        Q{idx + 1}
                      </Badge>
                      <h4 className="font-semibold text-base">{q.question}</h4>
                    </div>

                    <Badge variant={isCorrect ? "default" : "destructive"} className="text-xs flex items-center gap-1">
                      {isCorrect ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                      {isCorrect ? "Correct" : "Incorrect"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 ml-9 pt-2">
                    {q.options.map((opt: string, optIdx: number) => {
                      const optStr = opt.toString().trim();
                      const isUserChoice = optStr === userAns;
                      const isRightOption = optStr === correctAns;

                      let style = "border-border/60 bg-card/40 text-muted-foreground";
                      if (isRightOption) {
                        style = "border-emerald-500 bg-emerald-500/20 text-emerald-400 font-bold";
                      } else if (isUserChoice && !isRightOption) {
                        style = "border-destructive bg-destructive/20 text-destructive font-bold";
                      }

                      return (
                        <div key={optIdx} className={`p-3 rounded-xl border text-sm flex items-center justify-between ${style}`}>
                          <div className="flex items-center gap-2">
                            <Badge variant={isRightOption ? "default" : "outline"} className="text-xs h-5 px-1.5">
                              {String.fromCharCode(65 + optIdx)}
                            </Badge>
                            <span>{opt}</span>
                          </div>

                          {isUserChoice && (
                            <Badge variant="secondary" className="text-xs">
                              Student Answer
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
