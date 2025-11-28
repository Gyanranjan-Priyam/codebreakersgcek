"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/app/data/admin/require-admin";
import { revalidatePath } from "next/cache";

export interface QuizData {
  id: string;
  quizId: string;
  title: string;
  description: string;
  sets: number;
  duration: number;
  pointsPerQuestion: number;
  startDateTime: Date | null;
  endDateTime: Date | null;
  questionsJson: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  answer: string;
}

export async function getAllQuizzes() {
  await requireAdmin();
  
  try {
    const quizzes = await prisma.quiz.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      status: "success" as const,
      data: quizzes,
    };
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return {
      status: "error" as const,
      message: "Failed to fetch quizzes",
    };
  }
}

export async function getQuizById(id: string) {
  await requireAdmin();
  
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id },
    });

    if (!quiz) {
      return {
        status: "error" as const,
        message: "Quiz not found",
      };
    }

    return {
      status: "success" as const,
      data: quiz,
    };
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return {
      status: "error" as const,
      message: "Failed to fetch quiz",
    };
  }
}

export async function getQuizByQuizId(quizId: string) {
  await requireAdmin();
  
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { quizId },
    });

    if (!quiz) {
      return {
        status: "error" as const,
        message: "Quiz not found",
      };
    }

    return {
      status: "success" as const,
      data: quiz,
    };
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return {
      status: "error" as const,
      message: "Failed to fetch quiz",
    };
  }
}

export async function createQuiz(data: {
  quizId: string;
  title: string;
  description: string;
  sets: number;
  duration: number;
  pointsPerQuestion: number;
  startDateTime: Date | null;
  endDateTime: Date | null;
  questionsJson: string;
  createdBy: string;
}) {
  await requireAdmin();
  
  try {
    // Validate questions JSON
    try {
      const questions = JSON.parse(data.questionsJson);
      
      // Check if it's an object with sets (e.g., {"A": [...], "B": [...]})
      if (typeof questions === 'object' && !Array.isArray(questions)) {
        // Validate each set
        for (const setKey of Object.keys(questions)) {
          if (!Array.isArray(questions[setKey])) {
            return {
              status: "error" as const,
              message: `Set ${setKey} must contain an array of questions`,
            };
          }
          
          // Validate each question in the set
          for (const q of questions[setKey]) {
            if (!q.id || !q.question || !Array.isArray(q.options) || !q.answer) {
              return {
                status: "error" as const,
                message: `Each question in Set ${setKey} must have id, question, options array, and answer`,
              };
            }
          }
        }
      } 
      // Also support old format: single array of questions
      else if (Array.isArray(questions)) {
        // Validate each question
        for (const q of questions) {
          if (!q.id || !q.question || !Array.isArray(q.options) || !q.answer) {
            return {
              status: "error" as const,
              message: "Each question must have id, question, options array, and answer",
            };
          }
        }
      } else {
        return {
          status: "error" as const,
          message: "Questions must be an array or an object with sets",
        };
      }
    } catch (parseError) {
      return {
        status: "error" as const,
        message: "Invalid JSON format for questions",
      };
    }

    // Check if quizId already exists
    const existingQuiz = await prisma.quiz.findUnique({
      where: { quizId: data.quizId },
    });

    if (existingQuiz) {
      return {
        status: "error" as const,
        message: "Quiz ID already exists",
      };
    }

    const quiz = await prisma.quiz.create({
      data: {
        quizId: data.quizId,
        title: data.title,
        description: data.description,
        sets: data.sets,
        duration: data.duration,
        pointsPerQuestion: data.pointsPerQuestion,
        startDateTime: data.startDateTime,
        endDateTime: data.endDateTime,
        questionsJson: data.questionsJson,
        createdBy: data.createdBy,
      },
    });

    revalidatePath("/admin/quizzes");

    return {
      status: "success" as const,
      message: "Quiz created successfully",
      data: quiz,
    };
  } catch (error) {
    console.error("Error creating quiz:", error);
    return {
      status: "error" as const,
      message: "Failed to create quiz",
    };
  }
}

export async function updateQuiz(
  id: string,
  data: {
    title: string;
    description: string;
    sets: number;
    duration: number;
    pointsPerQuestion: number;
    startDateTime: Date | null;
    endDateTime: Date | null;
    questionsJson: string;
    isActive: boolean;
  }
) {
  await requireAdmin();
  
  try {
    // Validate questions JSON
    try {
      const questions = JSON.parse(data.questionsJson);
      
      // Check if it's an object with sets (e.g., {"A": [...], "B": [...]})
      if (typeof questions === 'object' && !Array.isArray(questions)) {
        // Validate each set
        for (const setKey of Object.keys(questions)) {
          if (!Array.isArray(questions[setKey])) {
            return {
              status: "error" as const,
              message: `Set ${setKey} must contain an array of questions`,
            };
          }
          
          // Validate each question in the set
          for (const q of questions[setKey]) {
            if (!q.id || !q.question || !Array.isArray(q.options) || !q.answer) {
              return {
                status: "error" as const,
                message: `Each question in Set ${setKey} must have id, question, options array, and answer`,
              };
            }
          }
        }
      } 
      // Also support old format: single array of questions
      else if (Array.isArray(questions)) {
        // Validate each question
        for (const q of questions) {
          if (!q.id || !q.question || !Array.isArray(q.options) || !q.answer) {
            return {
              status: "error" as const,
              message: "Each question must have id, question, options array, and answer",
            };
          }
        }
      } else {
        return {
          status: "error" as const,
          message: "Questions must be an array or an object with sets",
        };
      }
    } catch (parseError) {
      return {
        status: "error" as const,
        message: "Invalid JSON format for questions",
      };
    }

    const quiz = await prisma.quiz.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        sets: data.sets,
        duration: data.duration,
        pointsPerQuestion: data.pointsPerQuestion,
        startDateTime: data.startDateTime,
        endDateTime: data.endDateTime,
        questionsJson: data.questionsJson,
        isActive: data.isActive,
      },
    });

    revalidatePath("/admin/quizzes");

    return {
      status: "success" as const,
      message: "Quiz updated successfully",
      data: quiz,
    };
  } catch (error) {
    console.error("Error updating quiz:", error);
    return {
      status: "error" as const,
      message: "Failed to update quiz",
    };
  }
}

export async function deleteQuiz(id: string) {
  await requireAdmin();
  
  try {
    await prisma.quiz.delete({
      where: { id },
    });

    revalidatePath("/admin/quizzes");

    return {
      status: "success" as const,
      message: "Quiz deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting quiz:", error);
    return {
      status: "error" as const,
      message: "Failed to delete quiz",
    };
  }
}

export async function toggleQuizStatus(id: string, isActive: boolean) {
  await requireAdmin();
  
  try {
    const quiz = await prisma.quiz.update({
      where: { id },
      data: { isActive },
    });

    revalidatePath("/admin/quizzes");

    return {
      status: "success" as const,
      message: `Quiz ${isActive ? "activated" : "deactivated"} successfully`,
      data: quiz,
    };
  } catch (error) {
    console.error("Error toggling quiz status:", error);
    return {
      status: "error" as const,
      message: "Failed to update quiz status",
    };
  }
}
