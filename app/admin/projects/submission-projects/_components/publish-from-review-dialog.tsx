"use client";

import { useState, useTransition, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Globe, Loader2, Upload, XCircle } from "lucide-react";
import { publishProjectFromReview, updateProjectReviewStatus } from "../actions";
import { toast } from "sonner";
import Image from "next/image";

interface PublishFromReviewDialogProps {
  review: {
    id: string;
    repoName: string;
    repoUrl: string;
    description: string;
    explanation: string;
    whatsappNumber: string | null;
  };
}

export function PublishFromReviewDialog({ review }: PublishFromReviewDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [isFetchingRepoId, setIsFetchingRepoId] = useState(false);

  const [formData, setFormData] = useState({
    title: review.repoName,
    description: review.description || "",
    techStack: "",
    projectUrl: "",
    thumbnailUrl: "",
    githubRepoId: 0,
  });

  // Fetch GitHub repo ID when dialog opens
  useEffect(() => {
    if (open && !formData.githubRepoId) {
      fetchGitHubRepoId();
    }
  }, [open]);

  const fetchGitHubRepoId = async () => {
    setIsFetchingRepoId(true);
    try {
      // Extract owner and repo from GitHub URL
      // Expected format: https://github.com/owner/repo
      const urlMatch = review.repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      
      if (!urlMatch) {
        toast.error("Invalid GitHub URL format");
        setIsFetchingRepoId(false);
        return;
      }

      const [, owner, repoName] = urlMatch;

      // Fetch repo details from GitHub API
      const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "CodeBreakers-Dashboard",
        },
      });

      if (!response.ok) {
        toast.error("Failed to fetch repository details from GitHub");
        setIsFetchingRepoId(false);
        return;
      }

      const repoData = await response.json();
      
      setFormData((prev) => ({ 
        ...prev, 
        githubRepoId: repoData.id,
        projectUrl: repoData.homepage || prev.projectUrl,
      }));
      
      toast.success(`Repository ID fetched: ${repoData.id}`);
    } catch (error) {
      console.error("Error fetching GitHub repo ID:", error);
      toast.error("Failed to fetch repository ID");
    } finally {
      setIsFetchingRepoId(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 500 * 1024) {
      toast.error("Image size must be less than 500KB");
      return;
    }

    setIsUploading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("type", "profile");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
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

  const handlePublish = () => {
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
    if (!formData.githubRepoId) {
      toast.error("GitHub Repository ID is required");
      return;
    }

    startTransition(async () => {
      try {
        const result = await publishProjectFromReview({
          reviewId: review.id,
          title: formData.title.trim(),
          description: formData.description.trim(),
          techStack: formData.techStack.trim().split(",").map((t) => t.trim()).filter(Boolean),
          projectUrl: formData.projectUrl.trim() || null,
          thumbnailKey: formData.thumbnailUrl,
          githubRepoId: formData.githubRepoId,
        });

        if (result.success) {
          toast.success(result.message);
          setOpen(false);
          setFormData({
            title: review.repoName,
            description: review.description || "",
            techStack: "",
            projectUrl: "",
            thumbnailUrl: "",
            githubRepoId: 0,
          });
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error("Failed to publish project");
        console.error(error);
      }
    });
  };

  const handleReject = () => {
    startTransition(async () => {
      try {
        const result = await updateProjectReviewStatus({
          reviewId: review.id,
          status: "rejected",
          adminResponse: "Not suitable for website publication",
        });

        if (result.success) {
          toast.success(result.message);
          setOpen(false);
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error("Failed to reject project");
        console.error(error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default" className="gap-2 bg-green-600 hover:bg-green-700">
          <Globe className="h-3.5 w-3.5" />
          Review for Publishing
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Publish Project to Website</DialogTitle>
          <DialogDescription>
            Fill in the details to publish {review.repoName} to the homepage projects section
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Student's Explanation */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-sm mb-2">Student's Reason for Publishing:</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{review.explanation}</p>
            {review.whatsappNumber && (
              <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Contact:</span> {review.whatsappNumber}
                </p>
              </div>
            )}
          </div>

          {/* GitHub Repo ID */}
          <div className="space-y-2">
            <Label htmlFor="githubRepoId">
              GitHub Repository ID <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="githubRepoId"
                type="number"
                placeholder="Fetching from GitHub..."
                value={formData.githubRepoId || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, githubRepoId: parseInt(e.target.value) || 0 }))
                }
                disabled={isFetchingRepoId}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={fetchGitHubRepoId}
                disabled={isFetchingRepoId}
              >
                {isFetchingRepoId ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Fetching...
                  </>
                ) : (
                  "Refetch"
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {isFetchingRepoId ? (
                "Auto-fetching from GitHub API..."
              ) : formData.githubRepoId ? (
                <span className="text-green-600 dark:text-green-500">
                  ✓ Repository ID fetched successfully
                </span>
              ) : (
                "Repository ID will be auto-fetched from GitHub"
              )}
            </p>
          </div>

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
                    src={`https://codebreakers.t3.storage.dev/${formData.thumbnailUrl}`}
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
                {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
              </div>
              <p className="text-xs text-muted-foreground">
                Upload a thumbnail image (max 500KB, recommended size: 1200x630px)
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleReject}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Rejecting...
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </>
            )}
          </Button>
          <Button
            type="button"
            onClick={handlePublish}
            disabled={isPending || isUploading}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Globe className="w-4 h-4 mr-2" />
                Publish to Website
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
