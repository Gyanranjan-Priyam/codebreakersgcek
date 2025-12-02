"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getGitHubOrgRepos() {
  try {
    // Get current admin user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        status: 'error' as const,
        message: 'Authentication required.',
      };
    }

    // Get user's GitHub username
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { githubUsername: true, name: true },
    });

    if (!user?.githubUsername) {
      return {
        status: 'error' as const,
        message: 'GitHub account not linked. Please link your GitHub account in Admin Settings.',
      };
    }

    const githubUsername = user.githubUsername;

    // Fetch repositories from GitHub API (user repos)
    const response = await fetch(
      `https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=100`,
      {
        headers: {
          'Accept': 'application/vnd.github+json',
          // Add GitHub token if available for higher rate limits
          ...(process.env.GITHUB_TOKEN && {
            'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
          })
        },
        next: { revalidate: 300 } // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return {
          status: 'error' as const,
          message: `GitHub user "${githubUsername}" not found.`,
        };
      }
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const repos = await response.json();

    return {
      status: 'success' as const,
      data: repos.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        url: repo.html_url,
        description: repo.description,
        language: repo.language,
        stargazersCount: repo.stargazers_count,
        forksCount: repo.forks_count,
        openIssuesCount: repo.open_issues_count,
        updatedAt: repo.updated_at,
        createdAt: repo.created_at,
        private: repo.private,
        topics: repo.topics || [],
      })),
      githubUsername: githubUsername,
    };
  } catch (error) {
    console.error('Error fetching GitHub repos:', error);
    return {
      status: 'error' as const,
      message: 'Failed to fetch repositories from GitHub.',
    };
  }
}

interface PublishProjectData {
  githubRepoId: number;
  title: string;
  description: string;
  techStack: string[];
  projectUrl: string | null;
  thumbnailKey: string;
}

export async function publishProject(data: PublishProjectData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        status: 'error' as const,
        message: 'Authentication required.',
      };
    }

    // Check if project already published
    const existingProject = await prisma.publishedProject.findFirst({
      where: { githubRepoId: data.githubRepoId },
    });

    if (existingProject) {
      return {
        status: 'error' as const,
        message: 'This project is already published. Please unpublish it first to update.',
      };
    }

    // Create published project
    await prisma.publishedProject.create({
      data: {
        githubRepoId: data.githubRepoId,
        title: data.title,
        description: data.description,
        techStack: data.techStack,
        projectUrl: data.projectUrl,
        thumbnailKey: data.thumbnailKey,
        publishedById: session.user.id,
      },
    });

    revalidatePath('/admin/projects/all-projects');
    revalidatePath('/projects');

    return {
      status: 'success' as const,
      message: 'Project published successfully!',
    };
  } catch (error) {
    console.error('Error publishing project:', error);
    return {
      status: 'error' as const,
      message: 'Failed to publish project.',
    };
  }
}

export async function unpublishProject(githubRepoId: number) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        status: 'error' as const,
        message: 'Authentication required.',
      };
    }

    await prisma.publishedProject.deleteMany({
      where: { githubRepoId },
    });

    revalidatePath('/admin/projects/all-projects');
    revalidatePath('/projects');

    return {
      status: 'success' as const,
      message: 'Project unpublished successfully!',
    };
  } catch (error) {
    console.error('Error unpublishing project:', error);
    return {
      status: 'error' as const,
      message: 'Failed to unpublish project.',
    };
  }
}

export async function getPublishedProjects() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        status: 'error' as const,
        message: 'Authentication required.',
      };
    }

    const publishedProjects = await prisma.publishedProject.findMany({
      include: {
        publishedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      status: 'success' as const,
      data: publishedProjects,
    };
  } catch (error) {
    console.error('Error fetching published projects:', error);
    return {
      status: 'error' as const,
      message: 'Failed to fetch published projects.',
    };
  }
}
