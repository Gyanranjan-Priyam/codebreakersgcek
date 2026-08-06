import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getQuizByQuizId } from "../../actions";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PublishResultButton } from "./_components/publish-result-button";
import { PublishAllResultsButton } from "./_components/publish-all-results-button";
export default async function QuizResultsPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params;
  const result = await getQuizByQuizId(quizId);

  if (result.status === "error" || !result.data) {
    notFound();
  }

  const quiz = result.data;

  // Fetch all quiz attempts with user details
  const attempts = await prisma.quizAttempt.findMany({
    where: {
      quizId: quiz.id,
    },
    include: {
      quiz: {
        select: {
          title: true,
          quizId: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Fetch user details for all attempts
  const userIds = [...new Set(attempts.map(a => a.userId))];
  const users = await prisma.user.findMany({
    where: {
      id: {
        in: userIds,
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  const userMap = new Map(users.map(u => [u.id, u]));

  // Fetch set assignments
  const setAssignments = await prisma.quizSetAssignment.findMany({
    where: {
      quizId: quiz.id,
    },
    include: {
      quiz: {
        select: {
          questionsJson: true,
        },
      },
    },
  });

  // Fetch user details for assignments
  const assignmentUserIds = setAssignments.map(a => a.userId);
  const assignmentUsers = await prisma.user.findMany({
    where: {
      id: {
        in: assignmentUserIds,
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  const assignmentUserMap = new Map(assignmentUsers.map(u => [u.id, u]));

  // Calculate set distribution
  const setDistribution = setAssignments.reduce((acc, assignment) => {
    acc[assignment.assignedSet] = (acc[assignment.assignedSet] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate statistics
  const totalAttempts = attempts.length;
  const uniqueParticipants = userIds.length;
  const averageScore = totalAttempts > 0
    ? attempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts
    : 0;
  const averageCorrect = totalAttempts > 0
    ? attempts.reduce((sum, a) => sum + a.correctAnswers, 0) / totalAttempts
    : 0;

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/quizzes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Quiz Results
          </h1>
          <p className="text-muted-foreground mt-2">
            {quiz.title} ({quiz.quizId})
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/admin/quizzes/${quiz.quizId}`}>
            View Quiz Details
          </Link>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Attempts</CardDescription>
            <CardTitle className="text-3xl">{totalAttempts}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Unique Participants</CardDescription>
            <CardTitle className="text-3xl">{uniqueParticipants}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Score</CardDescription>
            <CardTitle className="text-3xl">{averageScore.toFixed(1)}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Correct Answers</CardDescription>
            <CardTitle className="text-3xl">{averageCorrect.toFixed(1)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Set Assignments Distribution */}
      {setAssignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Set Distribution</CardTitle>
            <CardDescription>
              Randomly assigned sets to {setAssignments.length} participant{setAssignments.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
              {Object.entries(setDistribution).sort().map(([set, count]) => (
                <div key={set} className="p-4 border rounded-lg text-center">
                  <div className="text-2xl font-bold">Set {set}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {count} user{count !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Set Assignments Table */}
      {setAssignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Set Assignments</CardTitle>
            <CardDescription>
              View which set is assigned to each participant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Participant</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Assigned Set</TableHead>
                    <TableHead>Assigned Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {setAssignments.map((assignment) => {
                    const user = assignmentUserMap.get(assignment.userId);
                    const hasAttempted = attempts.some(
                      a => a.userId === assignment.userId && a.completedAt
                    );
                    
                    return (
                      <TableRow key={assignment.id}>
                        <TableCell className="font-medium">
                          {user?.name || 'Unknown User'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user?.email || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">Set {assignment.assignedSet}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(assignment.assignedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {hasAttempted ? (
                            <Badge variant="default">Completed</Badge>
                          ) : (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
          <div>
            <CardTitle>All Attempts</CardTitle>
            <CardDescription>
              Detailed results for all quiz attempts
            </CardDescription>
          </div>
          {attempts.length > 0 && <PublishAllResultsButton quizId={quiz.id} />}
        </CardHeader>
        <CardContent>
          {attempts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No attempts recorded yet</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Participant</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Set</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Correct Answers</TableHead>
                    <TableHead>Total Questions</TableHead>
                    <TableHead>Points Earned</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attempts.map((attempt) => {
                    const user = userMap.get(attempt.userId);
                    const setLetter = String.fromCharCode(64 + attempt.setNumber);
                    return (
                      <TableRow key={attempt.id}>
                        <TableCell className="font-medium">
                          {attempt.participantName || user?.name || "Unknown User"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {attempt.participantEmail || user?.email || "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">Set {setLetter}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={attempt.score >= 70 ? "default" : attempt.score >= 50 ? "secondary" : "destructive"}>
                            {attempt.score.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {attempt.correctAnswers} / {attempt.totalQuestions}
                        </TableCell>
                        <TableCell>{attempt.totalQuestions}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{attempt.pointsEarned} pts</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={attempt.completedAt ? "default" : "secondary"}>
                            {attempt.completedAt ? "Completed" : "In Progress"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(attempt.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end items-center gap-2">
                            <PublishResultButton
                              attemptId={attempt.id}
                              isPublished={attempt.isPublished}
                              publishedAt={attempt.publishedAt}
                              size="sm"
                            />
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/quizzes/results/${quiz.quizId}/${attempt.id}`}>
                                View Details
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
