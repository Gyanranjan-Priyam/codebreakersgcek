import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/app/data/admin/get-current-user";
import { prisma } from "@/lib/db";
import QuizProctorInterface from "./_components/quiz-proctor-interface";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default async function QuizProctorPage({ 
  params 
}: { 
  params: Promise<{ quizId: string; identifier: string }> 
}) {
  const { quizId, identifier } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is banned
  if (user.banned) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-background to-destructive/5">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2 text-destructive">Access Blocked</h1>
            <p className="text-muted-foreground mb-4">
              You have been blocked from accessing quizzes.
            </p>
            {user.banReason && (
              <div className="p-4 bg-destructive/10 rounded-lg mb-4">
                <p className="text-sm font-medium text-destructive mb-1">Reason:</p>
                <p className="text-sm text-muted-foreground">{user.banReason}</p>
              </div>
            )}
            {user.banExpires && (
              <p className="text-sm text-muted-foreground mb-4">
                Ban expires: {new Date(user.banExpires).toLocaleString()}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Please contact the CodeBreakers coordinators for assistance.
            </p>
          </div>
          <div className="space-y-3">
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
            <Button asChild className="w-full">
              <Link href="/dashboard/contact-support">Contact Support</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Fetch quiz details
  const quiz = await prisma.quiz.findUnique({
    where: { quizId },
  });

  if (!quiz || !quiz.isActive) {
    notFound();
  }

  // Verify the identifier matches the current user
  const isValidUser = 
    (user as any).registration === identifier || 
    (user as any).username === identifier || 
    user.id === identifier;

  if (!isValidUser) {
    notFound();
  }

  // Check if user is blocked from this specific quiz
  const quizBlock = await prisma.quizBlock.findUnique({
    where: {
      quizId_userId: {
        quizId: quiz.id,
        userId: user.id,
      },
    },
  });

  if (quizBlock) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-background to-destructive/5">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2 text-destructive">Quiz Access Locked</h1>
            <p className="text-muted-foreground mb-4">
              You have been blocked from accessing this specific quiz due to violations.
            </p>
            <div className="p-4 bg-destructive/10 rounded-lg mb-4 text-left">
              <p className="text-sm font-medium text-destructive mb-2">Block Details:</p>
              <p className="text-sm text-muted-foreground mb-2">{quizBlock.reason}</p>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-1 bg-destructive/20 rounded text-destructive font-medium">
                  {quizBlock.violationType.replace(/_/g, ' ')}
                </span>
                <span className="text-muted-foreground">
                  {quizBlock.violationCount} violation{quizBlock.violationCount !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Blocked on: {new Date(quizBlock.blockedAt).toLocaleString()}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              This block is specific to this quiz. Please contact the administrators to appeal this decision.
            </p>
          </div>
          <div className="space-y-3">
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/quizzes">Back to Quizzes</Link>
            </Button>
            <Button asChild className="w-full">
              <Link href="/dashboard/contact-support">Contact Support</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Check if quiz is available based on date/time
  const now = new Date();
  if (quiz.startDateTime && new Date(quiz.startDateTime) > now) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Quiz Not Started Yet</h1>
          <p className="text-muted-foreground">
            This quiz will be available on {new Date(quiz.startDateTime).toLocaleString()}
          </p>
        </div>
      </div>
    );
  }

  if (quiz.endDateTime && new Date(quiz.endDateTime) < now) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Quiz Expired</h1>
          <p className="text-muted-foreground">
            This quiz ended on {new Date(quiz.endDateTime).toLocaleString()}
          </p>
        </div>
      </div>
    );
  }

  // Check if user has already attempted this quiz
  const existingAttempt = await prisma.quizAttempt.findFirst({
    where: {
      userId: user.id,
      quizId: quiz.id,
      completedAt: { not: null },
    },
  });

  // If user has already completed the quiz, redirect them
  if (existingAttempt) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-background to-muted">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Quiz Already Completed</h1>
            <p className="text-muted-foreground mb-6">
              You have already attempted this quiz. Each user can only take a quiz once.
            </p>
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Your Score</p>
              <p className="text-3xl font-bold">{existingAttempt.score}%</p>
              <p className="text-sm text-muted-foreground mt-1">
                {existingAttempt.correctAnswers} out of {existingAttempt.totalQuestions} correct
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => window.close()}
                variant="outline"
                className="flex-1"
              >
                Close Window
              </Button>
              <Button 
                onClick={() => window.location.href = `/dashboard/quizzes/results/${existingAttempt.id}`}
                className="flex-1"
              >
                View Results
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get or assign a set to the user
  let assignedSet: string;
  
  // Check if user already has an assigned set
  const existingAssignment = await prisma.quizSetAssignment.findUnique({
    where: {
      quizId_userId: {
        quizId: quiz.id,
        userId: user.id,
      },
    },
  });

  if (existingAssignment) {
    // User already has an assigned set
    assignedSet = existingAssignment.assignedSet;
  } else {
    // Parse questions to get available sets
    const questionsData = JSON.parse(quiz.questionsJson);
    const availableSets = Object.keys(questionsData);

    if (availableSets.length === 0) {
      notFound();
    }

    if (availableSets.length === 1) {
      // Only one set available, assign it
      assignedSet = availableSets[0];
    } else {
      // Multiple sets available, assign randomly
      const randomIndex = Math.floor(Math.random() * availableSets.length);
      assignedSet = availableSets[randomIndex];
    }

    // Save the assignment
    await prisma.quizSetAssignment.create({
      data: {
        quizId: quiz.id,
        userId: user.id,
        assignedSet,
      },
    });
  }

  return (
    <QuizProctorInterface 
      quiz={quiz}
      user={user}
      hasExistingAttempt={!!existingAttempt}
      assignedSet={assignedSet}
    />
  );
}
