"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

interface ExternalSubmitData {
  quizId: string;
  quizDbId: string;
  assignedSet: string;
  answers: Record<number, number>;
  tabSwitches: number;
  questionsJson: string;
  systemCode: string;
}

export async function submitExternalQuizAttemptFromInterface(data: ExternalSubmitData) {
  try {
    const system = await prisma.externalQuizSystem.findUnique({
      where: { systemCode: data.systemCode },
    });

    if (!system) {
      return { status: "error" as const, message: "External system session not found" };
    }

    if (system.status === "COMPLETED") {
      return { status: "error" as const, message: "Quiz already submitted for this system" };
    }

    // Parse questions for the assigned set
    const questionsData = JSON.parse(data.questionsJson);
    const questions = questionsData[data.assignedSet];

    if (!Array.isArray(questions)) {
      return { status: "error" as const, message: "Invalid questions data for the assigned set" };
    }

    // Calculate score the same way as internal
    let correctAnswers = 0;
    const detailedResults: Array<{
      questionIndex: number;
      question: string;
      userAnswer: number;
      correctAnswer: number;
      isCorrect: boolean;
      options: string[];
    }> = [];

    Object.entries(data.answers).forEach(([qIdxStr, answerIndex]) => {
      const questionIndex = parseInt(qIdxStr);
      const question = questions[questionIndex];
      if (!question) return;

      const correctAnswerIndex = question.options.findIndex(
        (opt: string) => opt === question.answer
      );
      const isCorrect = correctAnswerIndex === answerIndex;
      if (isCorrect) correctAnswers++;

      detailedResults.push({
        questionIndex,
        question: question.question,
        userAnswer: answerIndex,
        correctAnswer: correctAnswerIndex,
        isCorrect,
        options: question.options,
      });
    });

    const totalQuestions = questions.length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);

    const quiz = await prisma.quiz.findUnique({
      where: { id: data.quizDbId },
      select: { pointsPerQuestion: true },
    });

    const pointsEarned = correctAnswers * (quiz?.pointsPerQuestion || 1);
    const setNumber = data.assignedSet.charCodeAt(0) - 64; // A=1, B=2 ...

    // Build answersJson in the same format as internal
    const answersJson = JSON.stringify({
      answers: Object.entries(data.answers).map(([qIndex, aIndex]) => ({
        questionIndex: parseInt(qIndex),
        answerIndex: aIndex,
        correct: detailedResults.find((r) => r.questionIndex === parseInt(qIndex))?.isCorrect ?? false,
      })),
      tabSwitches: data.tabSwitches,
      submittedAt: new Date().toISOString(),
    });

    // Check for existing attempt by this external system
    const existingAttempt = await prisma.quizAttempt.findFirst({
      where: {
        quizId: data.quizDbId,
        externalSystemId: system.id,
      },
    });

    if (existingAttempt) {
      await prisma.quizAttempt.update({
        where: { id: existingAttempt.id },
        data: { score, totalQuestions, correctAnswers, pointsEarned, completedAt: new Date(), answersJson },
      });
    } else {
      await prisma.quizAttempt.create({
        data: {
          quizId: data.quizDbId,
          userId: `ext_${system.id}`,
          setNumber,
          score,
          totalQuestions,
          correctAnswers,
          pointsEarned,
          completedAt: new Date(),
          answersJson,
          participantName: system.assignedStudentName,
          participantEmail: system.assignedStudentEmail,
          externalSystemId: system.id,
        },
      });
    }

    // Mark system as completed
    await prisma.externalQuizSystem.update({
      where: { id: system.id },
      data: { status: "COMPLETED", completedAt: new Date() },
    });

    const { triggerPusherEvent } = await import("@/lib/pusher-server");
    triggerPusherEvent(`quiz-${data.quizDbId}`, "system-updated", { systemCode: data.systemCode, status: "COMPLETED" });
    triggerPusherEvent(`quiz-${data.quizId}`, "system-updated", { systemCode: data.systemCode, status: "COMPLETED" });
    triggerPusherEvent(`system-${data.systemCode}`, "status-changed", { status: "COMPLETED" });

    revalidatePath(`/admin/quizzes/results/${data.quizId}`);

    return {
      status: "success" as const,
      data: {
        score,
        correctAnswers,
        totalQuestions,
        pointsEarned,
        tabSwitches: data.tabSwitches,
        detailedResults,
      },
    };
  } catch (error) {
    console.error("Error submitting external quiz:", error);
    return { status: "error" as const, message: "Failed to submit quiz. Please try again." };
  }
}
