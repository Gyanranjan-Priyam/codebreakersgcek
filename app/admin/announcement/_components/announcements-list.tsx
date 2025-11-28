"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Archive, 
  Pin, 
  PinOff,
  Eye,
  Clock,
  Users,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RenderDescription } from "@/components/admin_components/rich-text-editor/RenderDescription";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteAnnouncement, updateAnnouncement } from "../action";

// Helper function to safely parse JSON content
const parseContent = (content: any) => {
  if (typeof content === 'string') {
    // Quick check: if it starts with < it's likely HTML, skip JSON parsing
    if (content.trim().startsWith('<')) {
      // Handle HTML content by converting to TipTap format
      return {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: content.replace(/<[^>]*>/g, '') // Strip HTML tags for display
              }
            ]
          }
        ]
      };
    }
    
    // Check if content looks like JSON (starts with { or [)
    if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
      try {
        return JSON.parse(content);
      } catch (error) {
        // Fallback to text content if JSON parsing fails
        return {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: content
                }
              ]
            }
          ]
        };
      }
    }
    
    // Handle plain text content
    return {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: content
            }
          ]
        }
      ]
    };
  }
  return content;
};

interface Announcement {
  id: string;
  slugId: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  audience: string;
  publishDate: Date;
  expiryDate?: Date | null;
  isPinned: boolean;
  showInHomeBanner: boolean;
  isRecurring: boolean;
  createdAt: Date;
  relatedEvent?: {
    id: string;
    title: string;
    slugId: string;
  } | null;
}

interface AnnouncementsListProps {
  announcements: Announcement[];
  onEdit?: (announcement: Announcement) => void;
  onRefresh?: () => void;
}

export function AnnouncementsList({ announcements, onEdit, onRefresh }: AnnouncementsListProps) {
  const [pending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    startTransition(async () => {
      try {
        const result = await deleteAnnouncement(id);
        
        if (result.success) {
          toast.success(result.message);
          onRefresh?.();
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        console.error("Error deleting announcement:", error);
        toast.error("Failed to delete announcement");
      } finally {
        setDeletingId(null);
      }
    });
  };

  const handleTogglePin = async (announcement: Announcement) => {
    startTransition(async () => {
      try {
        const result = await updateAnnouncement(announcement.id, {
          title: announcement.title,
          description: announcement.description,
          category: announcement.category as any,
          priority: announcement.priority as any,
          isPinned: !announcement.isPinned,
          publishDate: announcement.publishDate,
          expiryDate: announcement.expiryDate,
          attachmentKeys: [],
          imageKeys: [],
          audience: announcement.audience as any,
          sendNotifications: false,
          showInHomeBanner: announcement.showInHomeBanner,
          isRecurring: announcement.isRecurring,
          recurrenceType: "NONE",
          recurrenceInterval: null,
        });
        
        if (result.success) {
          toast.success(announcement.isPinned ? "Announcement unpinned" : "Announcement pinned");
          onRefresh?.();
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        console.error("Error updating announcement:", error);
        toast.error("Failed to update announcement");
      }
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'normal': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'emergency': return 'destructive';
      case 'system': return 'default';
      case 'event': return 'secondary';
      case 'academic': return 'outline';
      default: return 'secondary';
    }
  };

  if (announcements.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-muted-foreground text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No announcements yet</h3>
            <p>Create your first announcement to get started.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Announcements</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage and organize your announcements
          </p>
        </div>
        <div className="text-xs sm:text-sm text-muted-foreground">
          {announcements.length} announcement{announcements.length !== 1 ? 's' : ''} total
        </div>
      </div>

      <div className="grid gap-3 md:gap-4">
        {announcements.map((announcement) => (
          <Card key={announcement.id} className={`transition-all hover:shadow-md ${announcement.isPinned ? 'ring-2 ring-primary/20 bg-primary/5' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    {announcement.isPinned && (
                      <Pin className="h-4 w-4 text-primary shrink-0" />
                    )}
                    <CardTitle className="text-base sm:text-lg line-clamp-2">
                      {announcement.title}
                    </CardTitle>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <Badge variant={getPriorityColor(announcement.priority)} className="text-xs">
                      {announcement.priority}
                    </Badge>
                    <Badge variant={getCategoryColor(announcement.category)} className="text-xs">
                      <span className="hidden sm:inline">{announcement.category.replace('_', ' ')}</span>
                      <span className="sm:hidden">{announcement.category.replace('_', ' ').split(' ')[0]}</span>
                    </Badge>
                    {announcement.showInHomeBanner && (
                      <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                        <span className="hidden sm:inline">Homepage Banner</span>
                        <span className="sm:hidden">Banner</span>
                      </Badge>
                    )}
                    {announcement.isRecurring && (
                      <Badge variant="outline" className="text-xs text-purple-600 border-purple-200">
                        <span className="hidden sm:inline">Recurring</span>
                        <span className="sm:hidden">Recur</span>
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit?.(announcement)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleTogglePin(announcement)}>
                      {announcement.isPinned ? (
                        <>
                          <PinOff className="mr-2 h-4 w-4" />
                          Unpin
                        </>
                      ) : (
                        <>
                          <Pin className="mr-2 h-4 w-4" />
                          Pin
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem 
                          onSelect={(e) => e.preventDefault()}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{announcement.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(announcement.id)}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deletingId === announcement.id}
                          >
                            {deletingId === announcement.id ? 'Deleting...' : 'Delete'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="text-sm text-muted-foreground line-clamp-2 sm:line-clamp-3 mb-3 sm:mb-4">
                <RenderDescription json={parseContent(announcement.description)} />
              </div>
              
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1 font-mono">
                  <span className="font-semibold text-blue-600">{announcement.slugId}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span className="hidden sm:inline">Published {format(new Date(announcement.publishDate), "PPp")}</span>
                  <span className="sm:hidden">{format(new Date(announcement.publishDate), "dd/MM/yy")}</span>
                </div>
                
                {announcement.expiryDate && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span className="hidden sm:inline">Expires {format(new Date(announcement.expiryDate), "PPp")}</span>
                    <span className="sm:hidden">Exp: {format(new Date(announcement.expiryDate), "dd/MM/yy")}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span className="hidden sm:inline">{announcement.audience.replace('_', ' ').toLowerCase()}</span>
                  <span className="sm:hidden">{announcement.audience.replace('_', ' ').toLowerCase().split(' ')[0]}</span>
                </div>
                
                {announcement.relatedEvent && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span className="hidden sm:inline">Related to {announcement.relatedEvent.title}</span>
                    <span className="sm:hidden">Event</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}