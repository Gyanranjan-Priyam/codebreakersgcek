"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar, Clock, FileText, Image, AlertCircle, Info, TrendingUp, Users, EyeIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { RenderDescription } from "@/components/admin_components/rich-text-editor/RenderDescription";
import { type JSONContent } from "@tiptap/react";
import { ShareSocialCard } from "./share-social-card";
import { AttachmentViewer } from "./attachment-viewer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getAbsoluteUrl } from "@/lib/utils/get-base-url";

interface AnnouncementData {
  id: string;
  slugId: string;
  title: string;
  description: JSONContent | string | null | undefined;
  category: string;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  createdAt: string;
  updatedAt: string;
  attachmentKeys: string[];
  imageKeys: string[];
  createdBy: string;
}

// Priority styling
function getPriorityStyles(priority: string) {
  switch (priority) {
    case "URGENT":
      return {
        badge: "bg-red-100 text-red-800 border-red-200",
        icon: AlertCircle,
        color: "text-red-600"
      };
    case "HIGH":
      return {
        badge: "bg-orange-100 text-orange-800 border-orange-200",
        icon: TrendingUp,
        color: "text-orange-600"
      };
    case "NORMAL":
      return {
        badge: "bg-blue-100 text-blue-800 border-blue-200",
        icon: Info,
        color: "text-blue-600"
      };
    case "LOW":
      return {
        badge: "bg-gray-100 text-gray-800 border-gray-200",
        icon: Info,
        color: "text-gray-600"
      };
    default:
      return {
        badge: "bg-gray-100 text-gray-800 border-gray-200",
        icon: Info,
        color: "text-gray-600"
      };
  }
}

// Safe description renderer with better error handling
function SafeDescriptionRenderer({ description }: { description: any }) {
  // Handle string descriptions
  if (typeof description === 'string') {
    try {
      // Try to parse as JSON if it's a string
      const parsed = JSON.parse(description);
      if (parsed && typeof parsed === 'object' && (parsed.type || parsed.content)) {
        return <RenderDescription json={parsed} />;
      }
    } catch {
      // If parsing fails, treat as plain text
      return <p className="text-foreground">{description}</p>;
    }
    return <p className="text-foreground">{description}</p>;
  }

  // Handle JSONContent objects
  if (description && typeof description === 'object') {
    // Check if it's a valid TipTap JSONContent
    if (description.type || description.content) {
      return <RenderDescription json={description} />;
    }
    
    // If it's an object but not valid JSONContent, try to extract text
    const textContent = JSON.stringify(description);
    return <p className="text-muted-foreground">Content format not supported: {textContent}</p>;
  }

  return <p className="text-muted-foreground">No description available</p>;
}

// Category display names
function getCategoryDisplay(category: string) {
  const categoryMap: Record<string, string> = {
    GENERAL_ANNOUNCEMENT: "General",
    EVENT_UPDATE: "Event Update",
    REGISTRATION_UPDATE: "Registration",
    ACCOMMODATION_UPDATE: "Accommodation",
    PAYMENT_UPDATE: "Payment",
    TEAM_UPDATE: "Team",
    SYSTEM_MAINTENANCE: "System",
    URGENT_NOTICE: "Urgent"
  };
  
  return categoryMap[category] || category;
}

export function AnnouncementClient({ announcement }: { announcement: AnnouncementData }) {
  const [viewerState, setViewerState] = useState<{
    isOpen: boolean;
    attachmentKey: string;
    attachmentIndex: number;
    isImage: boolean;
  }>({
    isOpen: false,
    attachmentKey: "",
    attachmentIndex: 0,
    isImage: false,
  });

  const openViewer = (key: string, index: number, isImage: boolean = false) => {
    setViewerState({
      isOpen: true,
      attachmentKey: key,
      attachmentIndex: index,
      isImage,
    });
  };

  const closeViewer = () => {
    setViewerState(prev => ({ ...prev, isOpen: false }));
  };

  const priorityStyle = getPriorityStyles(announcement.priority);
  const PriorityIcon = priorityStyle.icon;

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-start justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-tight pr-2">
                {announcement.title}
              </h1>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <Badge variant="outline" className={`text-xs ${priorityStyle.badge} flex items-center gap-1`}>
                  <PriorityIcon className="h-3 w-3" />
                  <span className="hidden xs:inline">{announcement.priority}</span>
                  <span className="xs:hidden">{announcement.priority}</span>
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  <span className="hidden sm:inline">{getCategoryDisplay(announcement.category)}</span>
                  <span className="sm:hidden">{getCategoryDisplay(announcement.category).split(' ')[0]}</span>
                </Badge>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">
              Published {format(new Date(announcement.createdAt), 'PPP')}
            </span>
            <span className="sm:hidden">
              {format(new Date(announcement.createdAt), 'dd/MM/yy')}
            </span>
          </div>
          
          {announcement.updatedAt !== announcement.createdAt && (
            <div className="flex items-center gap-1">
              <span className="text-orange-600">•</span>
              <span className="hidden sm:inline">Updated {format(new Date(announcement.updatedAt), 'PPP')}</span>
              <span className="sm:hidden">Updated {format(new Date(announcement.updatedAt), 'dd/MM/yy')}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>ID: {announcement.slugId}</span>
          </div>
        </div>
      </div>

      <Separator className="mb-4 sm:mb-6" />

      {/* Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Description */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Announcement Details</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              <div className="prose dark:prose-invert max-w-none text-sm sm:text-base">
                <SafeDescriptionRenderer description={announcement.description} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Quick Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">Priority</span>
                <Badge variant="outline" className={`text-xs ${priorityStyle.badge}`}>
                  {announcement.priority}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">Category</span>
                <Badge variant="secondary" className="text-xs">
                  <span className="hidden sm:inline">{getCategoryDisplay(announcement.category)}</span>
                  <span className="sm:hidden">{getCategoryDisplay(announcement.category).split(' ')[0]}</span>
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">Published</span>
                <span className="text-xs">
                  {format(new Date(announcement.createdAt), 'dd/MM/yyyy')}
                </span>
              </div>
              
              {announcement.updatedAt !== announcement.createdAt && (
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground">Last Updated</span>
                  <span className="text-xs text-orange-600">
                    {format(new Date(announcement.updatedAt), 'dd/MM/yyyy')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attachments */}
          {(announcement.attachmentKeys.length > 0 || announcement.imageKeys.length > 0) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">Attachments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {announcement.attachmentKeys.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                      <span className="text-xs sm:text-sm font-medium">Files</span>
                      <Badge variant="secondary" className="text-xs">
                        {announcement.attachmentKeys.length}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {announcement.attachmentKeys.map((key, index) => (
                        <div key={key} className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="flex-1 justify-start text-xs h-8">
                            <FileText className="h-3 w-3 mr-2" />
                            <span className="hidden sm:inline">Attachment {index + 1}</span>
                            <span className="sm:hidden">File {index + 1}</span>
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="text-xs h-8 px-3"
                            onClick={() => openViewer(key, index, false)}
                          >
                            <span className="hidden sm:inline">View</span>
                            <span className="sm:hidden"><EyeIcon size={3}/></span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {announcement.imageKeys.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Image className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                      <span className="text-xs sm:text-sm font-medium">Images</span>
                      <Badge variant="secondary" className="text-xs">
                        {announcement.imageKeys.length}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {announcement.imageKeys.map((key, index) => (
                        <div key={key} className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="flex-1 justify-start text-xs h-8">
                            <Image className="h-3 w-3 mr-2" />
                            <span className="hidden sm:inline">Image {index + 1}</span>
                            <span className="sm:hidden">Img {index + 1}</span>
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="text-xs h-8 px-3"
                            onClick={() => openViewer(key, index, true)}
                          >
                            <span className="hidden sm:inline">View</span>
                            <span className="sm:hidden"><EyeIcon size={3}/></span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full" size="sm">
                    <span className="hidden sm:inline">Share Announcement</span>
                    <span className="sm:inline">Share</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm sm:max-w-md mx-4">
                  <DialogHeader>
                    <DialogTitle className="text-base sm:text-lg">Share Announcement</DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm">
                      Share this announcement with others through various platforms
                    </DialogDescription>
                  </DialogHeader>
                  <ShareSocialCard
                    title={announcement.title}
                    description={typeof announcement.description === 'string' 
                      ? announcement.description.substring(0, 100) + (announcement.description.length > 100 ? '...' : '')
                      : 'Check out this announcement'}
                    url={getAbsoluteUrl(`/announcement/${announcement.slugId}`)}
                  />
                </DialogContent>
              </Dialog>
              <Link 
               href={"/dashboard/contact-support"}
               className={buttonVariants({ variant: "outline", className: "w-full text-center text-xs sm:text-sm" })}>
                  <span className="hidden sm:inline">Report Issue</span>
                  <span className="sm:hidden">Report</span>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Attachment Viewer */}
      <AttachmentViewer
        isOpen={viewerState.isOpen}
        onClose={closeViewer}
        attachmentKey={viewerState.attachmentKey}
        attachmentIndex={viewerState.attachmentIndex}
        isImage={viewerState.isImage}
      />
    </div>
  );
}