import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Submit code
export const create = mutation({
  args: {
    problemId: v.id("problems"),
    userId: v.string(),
    language: v.string(),
    code: v.string(),
    status: v.union(
      v.literal("Accepted"),
      v.literal("Wrong Answer"),
      v.literal("Time Limit Exceeded"),
      v.literal("Runtime Error"),
      v.literal("Compilation Error"),
      v.literal("Pending")
    ),
    runtime: v.optional(v.number()),
    memory: v.optional(v.number()),
    testCasesPassed: v.number(),
    totalTestCases: v.number(),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const submissionId = await ctx.db.insert("submissions", {
      problemId: args.problemId,
      userId: args.userId,
      language: args.language,
      code: args.code,
      status: args.status,
      runtime: args.runtime,
      memory: args.memory,
      testCasesPassed: args.testCasesPassed,
      totalTestCases: args.totalTestCases,
      errorMessage: args.errorMessage,
      submittedAt: Date.now(),
    });

    // Update user progress
    const existingProgress = await ctx.db
      .query("userProgress")
      .withIndex("by_user_and_problem", (q) => 
        q.eq("userId", args.userId).eq("problemId", args.problemId)
      )
      .first();

    const now = Date.now();
    const isAccepted = args.status === "Accepted";

    if (existingProgress) {
      await ctx.db.patch(existingProgress._id, {
        status: isAccepted ? "Solved" : "Attempted",
        lastAttemptedAt: now,
        solvedAt: isAccepted ? now : existingProgress.solvedAt,
        bestSubmissionId: isAccepted ? submissionId : existingProgress.bestSubmissionId,
      });
    } else {
      await ctx.db.insert("userProgress", {
        userId: args.userId,
        problemId: args.problemId,
        status: isAccepted ? "Solved" : "Attempted",
        lastAttemptedAt: now,
        solvedAt: isAccepted ? now : undefined,
        bestSubmissionId: isAccepted ? submissionId : undefined,
      });
    }

    return submissionId;
  },
});

// Get user submissions for a problem
export const listByUserAndProblem = query({
  args: {
    userId: v.string(),
    problemId: v.id("problems"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("submissions")
      .withIndex("by_user_and_problem", (q) =>
        q.eq("userId", args.userId).eq("problemId", args.problemId)
      )
      .order("desc")
      .take(20);
  },
});

// Get all user submissions
export const listByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("submissions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);
  },
});

// Get submission by ID
export const get = query({
  args: { submissionId: v.id("submissions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.submissionId);
  },
});
