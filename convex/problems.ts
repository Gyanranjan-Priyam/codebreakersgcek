import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all problems
export const list = query({
  args: {},
  handler: async (ctx) => {
    const problems = await ctx.db.query("problems").collect();
    return problems;
  },
});

// Get problem by slug
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const problem = await ctx.db
      .query("problems")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    return problem;
  },
});

// Get problem by ID
export const get = query({
  args: { problemId: v.id("problems") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.problemId);
  },
});

// Create a new problem (admin only)
export const create = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    difficulty: v.union(v.literal("Easy"), v.literal("Medium"), v.literal("Hard")),
    description: v.string(),
    constraints: v.optional(v.string()),
    examples: v.array(v.object({
      input: v.string(),
      output: v.string(),
      explanation: v.optional(v.string()),
    })),
    testCases: v.array(v.object({
      input: v.string(),
      expectedOutput: v.string(),
      isHidden: v.boolean(),
    })),
    starterCode: v.object({
      cpp: v.optional(v.string()),
      java: v.optional(v.string()),
      python: v.optional(v.string()),
      python3: v.optional(v.string()),
      c: v.optional(v.string()),
      csharp: v.optional(v.string()),
      javascript: v.optional(v.string()),
      typescript: v.optional(v.string()),
    }),
    tags: v.array(v.string()),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const problemId = await ctx.db.insert("problems", {
      title: args.title,
      slug: args.slug,
      difficulty: args.difficulty,
      description: args.description,
      constraints: args.constraints,
      examples: args.examples,
      testCases: args.testCases,
      starterCode: args.starterCode,
      tags: args.tags,
      totalSubmissions: 0,
      totalAccepted: 0,
      createdBy: args.createdBy,
      createdAt: now,
      updatedAt: now,
    });

    return problemId;
  },
});

// Update problem stats
export const updateStats = mutation({
  args: {
    problemId: v.id("problems"),
    isAccepted: v.boolean(),
  },
  handler: async (ctx, args) => {
    const problem = await ctx.db.get(args.problemId);
    if (!problem) throw new Error("Problem not found");

    await ctx.db.patch(args.problemId, {
      totalSubmissions: problem.totalSubmissions + 1,
      totalAccepted: args.isAccepted 
        ? problem.totalAccepted + 1 
        : problem.totalAccepted,
      acceptanceRate: args.isAccepted
        ? ((problem.totalAccepted + 1) / (problem.totalSubmissions + 1)) * 100
        : (problem.totalAccepted / (problem.totalSubmissions + 1)) * 100,
      updatedAt: Date.now(),
    });
  },
});

// Get problems with user progress
export const listWithProgress = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const problems = await ctx.db.query("problems").collect();
    
    const progressMap = new Map();
    const userProgress = await ctx.db
      .query("userProgress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    userProgress.forEach(progress => {
      progressMap.set(progress.problemId, progress);
    });

    return problems.map(problem => ({
      ...problem,
      userStatus: progressMap.get(problem._id)?.status || "Not Started",
    }));
  },
});
