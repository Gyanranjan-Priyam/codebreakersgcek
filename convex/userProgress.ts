import { v } from "convex/values";
import { query } from "./_generated/server";

// Get user's progress for all problems
export const getByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userProgress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Get user's progress for a specific problem
export const getByUserAndProblem = query({
  args: {
    userId: v.string(),
    problemId: v.id("problems"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userProgress")
      .withIndex("by_user_and_problem", (q) =>
        q.eq("userId", args.userId).eq("problemId", args.problemId)
      )
      .first();
  },
});

// Get user stats
export const getStats = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("userProgress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const solved = progress.filter(p => p.status === "Solved").length;
    const attempted = progress.filter(p => p.status === "Attempted").length;

    return {
      totalSolved: solved,
      totalAttempted: attempted,
      totalProblems: await ctx.db.query("problems").collect().then(p => p.length),
    };
  },
});
