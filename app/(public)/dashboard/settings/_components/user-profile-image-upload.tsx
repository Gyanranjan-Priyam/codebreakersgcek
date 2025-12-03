"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Camera, Trash2, Loader2 } from "lucide-react";
import { updateUserProfileImage, removeUserProfileImage } from "../actions";
import { RenderEmptyState } from "@/components/file-uploader/RenderState";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface UserProfileImageUploadProps {
  currentImageKey?: string | null;
  userName: string;
}

export function UserProfileImageUpload({ currentImageKey, userName }: UserProfileImageUploadProps) {
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const getImageUrl = (imageKey: string | null | undefined) => {
    if (!imageKey) return undefined;
    // Construct S3 URL based on your bucket configuration
    const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES;
    let url;
    if (bucketName) {
      // Use the correct S3 URL format - codebreakers.t3.storage.dev
      url = `https://codebreakers.t3.storage.dev/${imageKey}`;
    } else {
      // Fallback for local development or if S3 isn't configured
      url = `/uploads/profiles/${imageKey}`;
    }
    return url;
  };

  const handleFileUpload = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'profile');

      // Upload file to S3
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadResult = await uploadResponse.json();

      if (uploadResult.success) {
        // Update user profile with new image key
        startTransition(async () => {
          const result = await updateUserProfileImage(uploadResult.key);
          
          if (result.status === "success") {
            toast.success("Profile image updated successfully");
          } else {
            toast.error(result.message);
          }
        });
      } else {
        toast.error(uploadResult.message || "Failed to upload image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    await handleFileUpload(file);
    // Reset the input
    event.target.value = '';
  };

  const handleRemoveImage = () => {
    startTransition(async () => {
      const result = await removeUserProfileImage();
      
      if (result.status === "success") {
        toast.success("Profile image removed successfully");
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isLoading = pending || uploading;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Profile Picture
        </CardTitle>
        <CardDescription>
          Upload a profile picture to personalize your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Image Display */}
        <div 
          className={`relative h-64 w-full border-2 border-dashed rounded-lg transition-colors ${
            isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          } ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {currentImageKey ? (
            <div className="relative group w-full h-full flex items-center justify-center">
              <Image
                src={getImageUrl(currentImageKey) || '/assets/logo.png'}
                alt={`${userName} profile picture`}
                fill
                className="object-cover rounded-lg"
                priority
                onError={(e) => {
                  console.error('Failed to load profile image');
                }}
              />
              <Button 
                type="button"
                variant="destructive" 
                size="icon"
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRemoveImage();
                }}
                disabled={pending}
              >
                {pending ? (
                  <Loader2 className="animate-spin size-4" />
                ) : (
                  <Trash2 className="size-4" />
                )}
              </Button>
            </div>
          ) : (
            <div className="relative h-full">
              <RenderEmptyState isDragActive={isDragActive} />
              <input
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                disabled={isLoading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Small Avatar Preview */}
        <div className="flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm font-medium mb-2">Current Profile Picture</p>
            <Avatar className="w-16 h-16 mx-auto">
              {currentImageKey ? (
                <AvatarImage 
                  src={getImageUrl(currentImageKey)} 
                  alt={userName}
                  className="object-cover"
                />
              ) : (
                <AvatarFallback className="text-lg font-semibold">
                  {getInitials(userName)}
                </AvatarFallback>
              )}
            </Avatar>
          </div>
        </div>

        {/* Upload Status */}
        {uploading && (
          <div className="text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Uploading image...</p>
          </div>
        )}

        {/* Upload Guidelines */}
        <div className="text-center space-y-1">
          <p className="text-sm text-muted-foreground">
            Drag & drop an image above or click to select
          </p>
          <p className="text-xs text-muted-foreground">
            Max: 5MB • Formats: JPG, PNG, WEBP
          </p>
        </div>
      </CardContent>
    </Card>
  );
}