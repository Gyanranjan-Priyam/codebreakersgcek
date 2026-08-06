import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import ExternalQuizWrapper from "./_components/external-quiz-wrapper";

export default async function ExternalExamRoomPage({
  params,
}: {
  params: Promise<{ systemCode: string }>;
}) {
  const { systemCode } = await params;

  const system = await prisma.externalQuizSystem.findUnique({
    where: { systemCode },
    include: { quiz: true },
  });

  if (!system || !system.quiz) {
    notFound();
  }

  // If system is only REGISTERED or ASSIGNED (admin has not clicked "Start Quiz"), redirect back to registration status page
  if (system.status === "REGISTERED" || system.status === "ASSIGNED") {
    redirect("/quiz/system-register");
  }

  const userId = `ext_${system.id}`;

  // Check if candidate is blocked for this quiz
  const existingBlock = await prisma.quizBlock.findFirst({
    where: {
      quizId: system.quiz.id,
      OR: [
        { userId: userId },
        { userId: system.id },
        { userId: system.systemCode },
      ],
    },
  });

  // Check if an attempt was already submitted for this external system
  const existingAttempt = await prisma.quizAttempt.findFirst({
    where: {
      quizId: system.quiz.id,
      externalSystemId: system.id,
    },
  });

  const isBlocked = system.status === "BLOCKED" || !!existingBlock;
  const isCompleted = system.status === "COMPLETED" || !!existingAttempt;
  const isAttempting = system.status === "ATTEMPTING" || system.status === "IN_PROGRESS";

  const assignedSet = system.assignedSet || "A";

  const quiz = {
    id: system.quiz.id,
    quizId: system.quiz.quizId,
    title: system.quiz.title,
    description: system.quiz.description,
    sets: system.quiz.sets,
    duration: system.quiz.duration,
    pointsPerQuestion: system.quiz.pointsPerQuestion,
    questionsJson: system.quiz.questionsJson,
    startDateTime: system.quiz.startDateTime?.toISOString() ?? null,
    endDateTime: system.quiz.endDateTime?.toISOString() ?? null,
    feedbackFormId: system.quiz.feedbackFormId,
    createdAt: system.quiz.createdAt?.toISOString() ?? null,
    updatedAt: system.quiz.updatedAt?.toISOString() ?? null,
  };

  const user = {
    id: userId,
    name: system.assignedStudentName || "Participant",
    email: system.assignedStudentEmail || "",
    registration: system.systemNumber,
    username: system.systemCode,
    mobile: null,
    branch: null,
  };

  return (
    <ExternalQuizWrapper
      quiz={quiz as any}
      user={user}
      assignedSet={assignedSet}
      systemCode={system.systemCode}
      isCompleted={isCompleted}
      isBlocked={isBlocked}
      isAttempting={isAttempting}
      blockReason={existingBlock?.reason || "Proctoring violation limit reached"}
    />
  );
}
