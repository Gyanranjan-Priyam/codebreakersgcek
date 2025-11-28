"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/app/data/admin/get-current-user";

interface SubmitQuizData {
  quizId: string;
  quizDbId: string;
  assignedSet: string;
  answers: Record<number, number>;
  tabSwitches: number;
  questionsJson: string;
}

export async function submitQuizAttempt(data: SubmitQuizData) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return {
        status: "error" as const,
        message: "User not authenticated",
      };
    }

    // Get quiz and check availability
    const quiz = await prisma.quiz.findUnique({
      where: { id: data.quizDbId },
      select: { 
        pointsPerQuestion: true,
        isActive: true,
        startDateTime: true,
        endDateTime: true,
        questionsJson: true,
      },
    });

    if (!quiz || !quiz.isActive) {
      return {
        status: "error" as const,
        message: "Quiz is not available",
      };
    }

    // Check quiz time availability
    const now = new Date();
    if (quiz.startDateTime && new Date(quiz.startDateTime) > now) {
      return {
        status: "error" as const,
        message: "Quiz has not started yet",
      };
    }

    if (quiz.endDateTime && new Date(quiz.endDateTime) < now) {
      return {
        status: "error" as const,
        message: "Quiz has expired",
      };
    }

    // Parse questions to calculate score
    const questionsData = JSON.parse(data.questionsJson);
    const questions = questionsData[data.assignedSet];
    
    if (!Array.isArray(questions)) {
      return {
        status: "error" as const,
        message: "Invalid questions data",
      };
    }

    // Calculate correct answers
    let correctAnswers = 0;
    const answersArray = Object.entries(data.answers).map(([qIndex, aIndex]) => {
      const question = questions[parseInt(qIndex)];
      // Convert string answer to index by finding which option matches
      const correctAnswerIndex = question?.options?.findIndex((opt: string) => opt === question.answer) ?? -1;
      const isCorrect = correctAnswerIndex === aIndex;
      if (isCorrect) correctAnswers++;
      return {
        questionIndex: parseInt(qIndex),
        answerIndex: aIndex,
        correct: isCorrect,
      };
    });

    // Create detailed results for frontend
    const detailedResults = Object.entries(data.answers).map(([qIndex, userAnswer]) => {
      const questionIndex = parseInt(qIndex);
      const question = questions[questionIndex];
      // Convert string answer to index by finding which option matches
      const correctAnswerIndex = question.options.findIndex((opt: string) => opt === question.answer);
      return {
        questionIndex,
        question: question.question,
        userAnswer,
        correctAnswer: correctAnswerIndex,
        isCorrect: correctAnswerIndex === userAnswer,
        options: question.options,
      };
    });

    const totalQuestions = questions.length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    
    const pointsEarned = correctAnswers * (quiz?.pointsPerQuestion || 1);

    // Convert set letter to number (A=0, B=1, etc.)
    const setNumber = data.assignedSet.charCodeAt(0) - 65;

    // Check if attempt already exists
    const existingAttempt = await prisma.quizAttempt.findFirst({
      where: {
        quizId: data.quizDbId,
        userId: user.id,
        setNumber,
      },
    });

    if (existingAttempt) {
      // Update existing attempt
      await prisma.quizAttempt.update({
        where: { id: existingAttempt.id },
        data: {
          score,
          totalQuestions,
          correctAnswers,
          pointsEarned,
          completedAt: new Date(),
          answersJson: JSON.stringify({
            answers: answersArray,
            tabSwitches: data.tabSwitches,
            submittedAt: new Date().toISOString(),
          }),
        },
      });
    } else {
      // Create new attempt
      await prisma.quizAttempt.create({
        data: {
          quizId: data.quizDbId,
          userId: user.id,
          setNumber,
          score,
          totalQuestions,
          correctAnswers,
          pointsEarned,
          completedAt: new Date(),
          answersJson: JSON.stringify({
            answers: answersArray,
            tabSwitches: data.tabSwitches,
            submittedAt: new Date().toISOString(),
          }),
        },
      });
    }

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
    console.error("Error submitting quiz:", error);
    return {
      status: "error" as const,
      message: "Failed to submit quiz. Please try again.",
    };
  }
}
