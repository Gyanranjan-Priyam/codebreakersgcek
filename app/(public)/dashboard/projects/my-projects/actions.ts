"use server";

import { getCurrentUser } from "@/app/data/admin/get-current-user";
import { prisma } from "@/lib/db";

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  topics: string[];
  visibility: string;
  fork: boolean;
}

export async function getUserGitHubRepos() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        status: "error" as const,
        message: "Not authenticated",
      };
    }

    // Fetch full user data with githubUsername
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        name: true,
        githubUsername: true,
      },
    });

    if (!user) {
      return {
        status: "error" as const,
        message: "User not found",
      };
    }

    // Check if user has GitHub username
    if (!user.githubUsername) {
      return {
        status: "error" as const,
        message: "GitHub username not configured in your profile",
      };
    }

    // Fetch repositories from GitHub API
    // Note: Without authentication, only public repos are visible
    const response = await fetch(
      `https://api.github.com/users/${user.githubUsername}/repos?sort=updated&per_page=100`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          // Add User-Agent to avoid rate limiting
          "User-Agent": "CodeBreakers-Dashboard",
        },
        cache: "no-store", // Don't cache to get fresh data
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return {
          status: "error" as const,
          message: "GitHub user not found. Please check your GitHub username in settings.",
        };
      }
      return {
        status: "error" as const,
        message: "Failed to fetch repositories from GitHub",
      };
    }

    const repos: GitHubRepo[] = await response.json();

    // Filter out forked repos (optional)
    const originalRepos = repos.filter(repo => !repo.fork);

    return {
      status: "success" as const,
      data: {
        user: {
          name: user.name,
          githubUsername: user.githubUsername,
        },
        repos: originalRepos,
        allRepos: repos,
      },
    };
  } catch (error) {
    return {
      status: "error" as const,
      message: "An error occurred while fetching repositories",
    };
  }
}
