import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft, Edit, Clock, Calendar, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { getQuizByQuizId } from "../actions";
import { notFound } from "next/navigation";
import { ExportQuizPDF } from "./_components/ExportQuizPDF";

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

  // Calculate total questions across all sets
  let totalQuestions = 0;
  if (typeof questionsData === 'object' && !Array.isArray(questionsData)) {
    totalQuestions = Object.values(questionsData).reduce((sum: number, questions: any) => sum + questions.length, 0);
  } else if (Array.isArray(questionsData)) {
    totalQuestions = questionsData.length;
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/quizzes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Quiz Details
            </h1>
            <p className="text-muted-foreground mt-2">
              View complete quiz information
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/admin/quizzes/edit/${quiz.quizId}`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Quiz
          </Link>
        </Button>
      </div>

      {/* Quiz Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{quiz.title}</CardTitle>
              <CardDescription className="mt-2">
                <span className="font-mono text-sm">{quiz.quizId}</span>
              </CardDescription>
            </div>
            <Badge variant={quiz.isActive ? "default" : "secondary"}>
              {quiz.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
              <div className="p-2 rounded-lg bg-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Questions</p>
                <p className="text-2xl font-bold">{totalQuestions}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
              <div className="p-2 rounded-lg bg-primary/10">
                <Badge variant="outline" className="text-lg font-bold">{quiz.sets}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sets</p>
                <p className="text-2xl font-bold">{quiz.sets}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-2xl font-bold">{quiz.duration}<span className="text-sm font-normal ml-1">min</span></p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-sm font-medium">{new Date(quiz.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Description / Rules</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{quiz.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Questions by Set */}
      {typeof questionsData === 'object' && !Array.isArray(questionsData) ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Quiz Questions by Set</CardTitle>
                <CardDescription>Click on a set to view its questions</CardDescription>
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
                        <span className="font-semibold">Set {setKey}</span>
                        <Badge variant="outline">
                          {questionsData[setKey].length} question{questionsData[setKey].length > 1 ? 's' : ''}
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
                    <div className="space-y-4 pt-4">
                      {questionsData[setKey].map((question: any, index: number) => (
                        <Card key={index} className="bg-muted/50">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-start gap-3">
                                <Badge variant="outline" className="mt-0.5">
                                  Q{question.id}
                                </Badge>
                                <p className="font-medium flex-1">{question.question}</p>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-12">
                                {question.options.map((opt: string, i: number) => (
                                  <div
                                    key={i}
                                    className={`p-2 rounded-lg border-2 ${
                                      opt === question.answer
                                        ? "border-primary bg-primary/10"
                                        : "border-border bg-background"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        variant={opt === question.answer ? "default" : "outline"}
                                        className="text-xs"
                                      >
                                        {String.fromCharCode(65 + i)}
                                      </Badge>
                                      <span className="text-sm">{opt}</span>
                                      {opt === question.answer && (
                                        <CheckCircle2 className="h-4 w-4 ml-auto text-primary" />
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="ml-12 text-sm text-muted-foreground">
                                Correct Answer: <span className="font-medium text-primary">{question.answer}</span>
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
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Questions</CardTitle>
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
            <div className="space-y-4">
              {questionsData.map((question: any, index: number) => (
                <Card key={index} className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="mt-0.5">
                          Q{question.id}
                        </Badge>
                        <p className="font-medium flex-1">{question.question}</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-12">
                        {question.options.map((opt: string, i: number) => (
                          <div
                            key={i}
                            className={`p-2 rounded-lg border-2 ${
                              opt === question.answer
                                ? "border-primary bg-primary/10"
                                : "border-border bg-background"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={opt === question.answer ? "default" : "outline"}
                                className="text-xs"
                              >
                                {String.fromCharCode(65 + i)}
                              </Badge>
                              <span className="text-sm">{opt}</span>
                              {opt === question.answer && (
                                <CheckCircle2 className="h-4 w-4 ml-auto text-primary" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="ml-12 text-sm text-muted-foreground">
                        Correct Answer: <span className="font-medium text-primary">{question.answer}</span>
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
