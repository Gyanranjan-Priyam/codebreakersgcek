"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// Folder Actions
export async function createResourceFolder(data: {
  name: string;
  description?: string;
  icon?: string;
  order?: number;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return { status: "error", message: "Unauthorized" };
  }

  try {
    const folder = await prisma.resourceFolder.create({
      data: {
        name: data.name,
        description: data.description,
        icon: data.icon || "📁",
        order: data.order || 0,
        createdById: session.user.id,
      },
    });

    revalidatePath("/admin/resources");
    return { status: "success", data: folder };
  } catch (error) {
    console.error("Error creating resource folder:", error);
    return { status: "error", message: "Failed to create folder" };
  }
}

export async function updateResourceFolder(
  id: string,
  data: {
    name?: string;
    description?: string;
    icon?: string;
    order?: number;
    isActive?: boolean;
  }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return { status: "error", message: "Unauthorized" };
  }

  try {
    const folder = await prisma.resourceFolder.update({
      where: { id },
      data,
    });

    revalidatePath("/admin/resources");
    return { status: "success", data: folder };
  } catch (error) {
    console.error("Error updating resource folder:", error);
    return { status: "error", message: "Failed to update folder" };
  }
}

export async function deleteResourceFolder(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return { status: "error", message: "Unauthorized" };
  }

  try {
    await prisma.resourceFolder.delete({
      where: { id },
    });

    revalidatePath("/admin/resources");
    return { status: "success" };
  } catch (error) {
    console.error("Error deleting resource folder:", error);
    return { status: "error", message: "Failed to delete folder" };
  }
}

export async function getResourceFolders() {
  try {
    const folders = await prisma.resourceFolder.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { resources: true },
        },
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { order: "asc" },
    });

    return { status: "success", data: folders };
  } catch (error) {
    console.error("Error fetching resource folders:", error);
    return { status: "error", message: "Failed to fetch folders" };
  }
}

// Resource Actions
export async function createResource(data: {
  folderId: string;
  title: string;
  description?: string;
  type: string;
  url: string;
  thumbnailUrl?: string;
  fileSize?: string;
  duration?: string;
  tags?: string[];
  order?: number;
  downloadable?: boolean;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return { status: "error", message: "Unauthorized" };
  }

  try {
    const resource = await prisma.resource.create({
      data: {
        folderId: data.folderId,
        title: data.title,
        description: data.description,
        type: data.type,
        url: data.url,
        thumbnailUrl: data.thumbnailUrl,
        fileSize: data.fileSize,
        duration: data.duration,
        tags: data.tags || [],
        order: data.order || 0,
        downloadable: data.downloadable ?? true,
        uploadedById: session.user.id,
      },
    });

    revalidatePath("/admin/resources");
    revalidatePath(`/admin/resources/${data.folderId}`);
    return { status: "success", data: resource };
  } catch (error) {
    console.error("Error creating resource:", error);
    return { status: "error", message: "Failed to create resource" };
  }
}

export async function updateResource(
  id: string,
  data: {
    title?: string;
    description?: string;
    type?: string;
    url?: string;
    thumbnailUrl?: string;
    fileSize?: string;
    duration?: string;
    tags?: string[];
    order?: number;
    downloadable?: boolean;
    isActive?: boolean;
  }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return { status: "error", message: "Unauthorized" };
  }

  try {
    const resource = await prisma.resource.update({
      where: { id },
      data,
    });

    revalidatePath("/admin/resources");
    revalidatePath(`/admin/resources/${resource.folderId}`);
    return { status: "success", data: resource };
  } catch (error) {
    console.error("Error updating resource:", error);
    return { status: "error", message: "Failed to update resource" };
  }
}

export async function deleteResource(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return { status: "error", message: "Unauthorized" };
  }

  try {
    const resource = await prisma.resource.delete({
      where: { id },
    });

    revalidatePath("/admin/resources");
    revalidatePath(`/admin/resources/${resource.folderId}`);
    return { status: "success" };
  } catch (error) {
    console.error("Error deleting resource:", error);
    return { status: "error", message: "Failed to delete resource" };
  }
}

export async function getResourcesByFolder(folderId: string) {
  try {
    const resources = await prisma.resource.findMany({
      where: {
        folderId,
        isActive: true,
      },
      include: {
        uploadedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { order: "asc" },
    });

    return { status: "success", data: resources };
  } catch (error) {
    console.error("Error fetching resources:", error);
    return { status: "error", message: "Failed to fetch resources" };
  }
}
