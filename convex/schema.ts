import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // User workspaces - each user has their own isolated environment
  workspaces: defineTable({
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Files in each workspace
  files: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.string(),
    path: v.string(), // e.g., "/src/index.js"
    name: v.string(), // e.g., "index.js"
    content: v.string(),
    language: v.string(), // javascript, typescript, python, etc.
    isDirectory: v.boolean(),
    parentPath: v.optional(v.string()), // for nested files
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_user", ["userId"])
    .index("by_workspace_and_path", ["workspaceId", "path"]),

  // LeetCode-style problems
  problems: defineTable({
    title: v.string(),
    slug: v.string(), // URL-friendly version of title
    difficulty: v.union(v.literal("Easy"), v.literal("Medium"), v.literal("Hard")),
    description: v.string(), // HTML/Markdown description
    constraints: v.optional(v.string()),
    examples: v.array(v.object({
      input: v.string(),
      output: v.string(),
      explanation: v.optional(v.string()),
    })),
    testCases: v.array(v.object({
      input: v.string(),
      expectedOutput: v.string(),
      isHidden: v.boolean(), // Some test cases are hidden from users
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
    solution: v.optional(v.object({
      cpp: v.optional(v.string()),
      java: v.optional(v.string()),
      python: v.optional(v.string()),
      python3: v.optional(v.string()),
      c: v.optional(v.string()),
      csharp: v.optional(v.string()),
      javascript: v.optional(v.string()),
      typescript: v.optional(v.string()),
    })),
    tags: v.array(v.string()), // Array, String, Hash Table, etc.
    acceptanceRate: v.optional(v.number()),
    totalSubmissions: v.number(),
    totalAccepted: v.number(),
    createdBy: v.string(), // admin user ID
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_difficulty", ["difficulty"])
    .index("by_slug", ["slug"]),

  // User submissions
  submissions: defineTable({
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
    runtime: v.optional(v.number()), // in milliseconds
    memory: v.optional(v.number()), // in KB
    testCasesPassed: v.number(),
    totalTestCases: v.number(),
    errorMessage: v.optional(v.string()),
    submittedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_problem", ["problemId"])
    .index("by_user_and_problem", ["userId", "problemId"]),

  // User problem progress
  userProgress: defineTable({
    userId: v.string(),
    problemId: v.id("problems"),
    status: v.union(
      v.literal("Solved"),
      v.literal("Attempted"),
      v.literal("Not Started")
    ),
    lastAttemptedAt: v.optional(v.number()),
    solvedAt: v.optional(v.number()),
    bestSubmissionId: v.optional(v.id("submissions")),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_problem", ["userId", "problemId"]),
});
