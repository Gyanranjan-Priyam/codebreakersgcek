import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/app/data/admin/get-current-user";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Award, Clock, ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default async function QuizResultsPage({ 
  params 
}: { 
  params: Promise<{ attemptId: string }> 
}) {
  const { attemptId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch the quiz attempt
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: true,
    },
  });

  if (!attempt || attempt.userId !== user.id) {
    notFound();
  }

  // Parse the answers
  let answersData: any = {};
  let detailedResults: any[] = [];
  let tabSwitches = 0;

  if (attempt.answersJson) {
    try {
      answersData = JSON.parse(attempt.answersJson);
      tabSwitches = answersData.tabSwitches || 0;
    } catch (e) {
      console.error("Error parsing answers:", e);
    }
  }

  // Parse questions to get the set the user took
  const questionsData = JSON.parse(attempt.quiz.questionsJson);
  const setLetter = String.fromCharCode(65 + attempt.setNumber);
  const questions = questionsData[setLetter];

  // Build detailed results
  if (answersData.answers && Array.isArray(answersData.answers)) {
    detailedResults = answersData.answers.map((answer: any) => {
      const question = questions[answer.questionIndex];
      const correctAnswerIndex = question.options.findIndex((opt: string) => opt === question.answer);
      
      return {
        questionIndex: answer.questionIndex,
        question: question.question,
        userAnswer: answer.answerIndex,
        correctAnswer: correctAnswerIndex,
        isCorrect: answer.correct,
        options: question.options,
      };
    });
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Quiz Results
          </h1>
          <p className="text-muted-foreground mt-1">
            {attempt.quiz.title}
          </p>
        </div>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Performance</CardTitle>
            <Badge variant={attempt.score >= 70 ? "default" : "secondary"} className="text-lg px-4 py-1">
              {attempt.score}%
            </Badge>
          </div>
          <CardDescription>
            Completed on {attempt.completedAt ? new Date(attempt.completedAt).toLocaleString() : "N/A"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="text-3xl font-bold text-primary">{attempt.score}%</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Correct</p>
              <p className="text-3xl font-bold text-green-600">{attempt.correctAnswers}</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-3xl font-bold">{attempt.totalQuestions}</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Points</p>
              <p className="text-3xl font-bold text-primary">{attempt.pointsEarned}</p>
            </div>
          </div>

          {tabSwitches > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Note:</strong> {tabSwitches} violation{tabSwitches !== 1 ? 's' : ''} detected during the quiz.
              </AlertDescription>
            </Alert>
          )}

          {/* Quiz Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center justify-between text-sm p-3 bg-muted rounded-lg">
              <span className="text-muted-foreground">Quiz Set:</span>
              <span className="font-medium">Set {setLetter}</span>
            </div>
            <div className="flex items-center justify-between text-sm p-3 bg-muted rounded-lg">
              <span className="text-muted-foreground">Points Per Question:</span>
              <span className="font-medium">{attempt.quiz.pointsPerQuestion}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      {detailedResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Answer Review</CardTitle>
            <CardDescription>
              Review your answers and see the correct solutions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {detailedResults.map((result, index) => (
                <div 
                  key={result.questionIndex} 
                  className={`p-4 rounded-lg border-2 ${
                    result.isCorrect 
                      ? 'border-green-600 bg-green-600/5' 
                      : 'border-red-600 bg-red-600/5'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      result.isCorrect 
                        ? 'bg-green-600 text-white' 
                        : 'bg-red-600 text-white'
                    }`}>
                      {result.isCorrect ? '✓' : '✗'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">Question {result.questionIndex + 1}</h4>
                        <Badge variant={result.isCorrect ? "default" : "destructive"}>
                          {result.isCorrect ? 'Correct' : 'Incorrect'}
                        </Badge>
                      </div>
                      <p className="text-sm mb-3">{result.question}</p>
                      
                      <div className="space-y-2">
                        {result.options.map((option: string, oIndex: number) => {
                          const isUserAnswer = result.userAnswer === oIndex;
                          const isCorrectAnswer = result.correctAnswer === oIndex;
                          
                          return (
                            <div 
                              key={oIndex}
                              className={`p-3 rounded-lg border text-sm ${
                                isCorrectAnswer
                                  ? 'border-green-600 bg-green-600/10'
                                  : isUserAnswer && !result.isCorrect
                                  ? 'border-red-600 bg-red-600/10'
                                  : 'border-muted bg-background'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{String.fromCharCode(65 + oIndex)}.</span>
                                <span className="flex-1">{option}</span>
                                {isCorrectAnswer && (
                                  <Badge variant="outline" className="border-green-600 text-green-600 text-xs">
                                    Correct Answer
                                  </Badge>
                                )}
                                {isUserAnswer && !result.isCorrect && (
                                  <Badge variant="outline" className="border-red-600 text-red-600 text-xs">
                                    Your Answer
                                  </Badge>
                                )}
                                {isUserAnswer && result.isCorrect && (
                                  <Badge variant="outline" className="border-green-600 text-green-600 text-xs">
                                    Your Answer
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {!result.isCorrect && (
                        <div className="mt-3 p-2 bg-muted rounded text-xs">
                          <span className="text-muted-foreground">
                            You selected: <strong>{String.fromCharCode(65 + result.userAnswer)}</strong> | 
                            Correct answer: <strong>{String.fromCharCode(65 + result.correctAnswer)}</strong>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Button */}
      <Card>
        <CardContent className="p-6">
          <Button 
            asChild
            className="w-full"
            size="lg"
          >
            <Link href="/dashboard/quizzes">
              Back to Quizzes
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
