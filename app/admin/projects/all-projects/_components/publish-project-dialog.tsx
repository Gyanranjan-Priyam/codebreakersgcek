"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Loader2, Globe } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { publishProject } from "../actions";

interface PublishProjectDialogProps {
  repo: {
    id: number;
    name: string;
    description: string | null;
    url: string;
  };
}

export function PublishProjectDialog({ repo }: PublishProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: repo.name,
    description: repo.description || "",
    techStack: "",
    projectUrl: repo.url,
    thumbnailUrl: "",
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (500KB max)
    if (file.size > 500 * 1024) {
      toast.error("Image size must be less than 500KB");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setFormData((prev) => ({ ...prev, thumbnailUrl: data.key }));
        toast.success("Image uploaded successfully");
      } else {
        toast.error(data.message || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePublish = async () => {
    // Validate required fields
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }
    if (!formData.techStack.trim()) {
      toast.error("Tech stack is required");
      return;
    }
    if (!formData.thumbnailUrl) {
      toast.error("Thumbnail image is required");
      return;
    }

    setIsPublishing(true);

    try {
      const result = await publishProject({
        githubRepoId: repo.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        techStack: formData.techStack.trim().split(",").map(t => t.trim()).filter(Boolean),
        projectUrl: formData.projectUrl.trim() || null,
        thumbnailKey: formData.thumbnailUrl,
      });

      if (result.status === "success") {
        toast.success("Project published successfully!");
        setOpen(false);
        // Reset form
        setFormData({
          title: repo.name,
          description: repo.description || "",
          techStack: "",
          projectUrl: repo.url,
          thumbnailUrl: "",
        });
      } else {
        toast.error(result.message || "Failed to publish project");
      }
    } catch (error) {
      console.error("Error publishing project:", error);
      toast.error("Failed to publish project");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <>
      <Button
        variant="default"
        size="sm"
        onClick={() => setOpen(true)}
        className="w-full cursor-pointer"
      >
        <Globe className="w-4 h-4 mr-2" />
        Publish to Website
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Publish Project to Website</DialogTitle>
            <DialogDescription>
              Fill in the details to publish {repo.name} to the homepage projects section.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Enter project title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Enter project description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={4}
              />
            </div>

            {/* Tech Stack */}
            <div className="space-y-2">
              <Label htmlFor="techStack">
                Tech Stack <span className="text-red-500">*</span>
              </Label>
              <Input
                id="techStack"
                placeholder="React, Node.js, MongoDB (comma-separated)"
                value={formData.techStack}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, techStack: e.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Enter technologies separated by commas
              </p>
            </div>

            {/* Project URL */}
            <div className="space-y-2">
              <Label htmlFor="projectUrl">Project URL (Optional)</Label>
              <Input
                id="projectUrl"
                placeholder="https://example.com"
                value={formData.projectUrl}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, projectUrl: e.target.value }))
                }
              />
            </div>

            {/* Thumbnail Upload */}
            <div className="space-y-2">
              <Label htmlFor="thumbnail">
                Thumbnail Image <span className="text-red-500">*</span>
              </Label>
              <div className="flex flex-col gap-4">
                {formData.thumbnailUrl && (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_S3_BASE_URL}/${formData.thumbnailUrl}`}
                      alt="Thumbnail preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Input
                    id="thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="cursor-pointer"
                  />
                  {isUploading && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload a thumbnail image (max 500KB, recommended size: 1200x630px)
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPublishing}
            >
              Cancel
            </Button>
            <Button onClick={handlePublish} disabled={isPublishing || isUploading}>
              {isPublishing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 mr-2" />
                  Publish Project
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
