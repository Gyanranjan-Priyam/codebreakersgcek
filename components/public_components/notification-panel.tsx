"use client";

import { useState, useEffect } from "react";
import { X, Bell, Calendar, Clock, Paperclip, Image, Eye, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow, format } from "date-fns";
import { useNotification } from "./notification-context";
import { useRouter } from "next/navigation";

interface Announcement {
  id: string;
  slugId: string;
  title: string;
  description: any; // TipTap JSON content
  category: string;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  createdAt: string;
  updatedAt: string;
  relatedEvent?: {
    title: string;
    slugId: string;
  };
  hasAttachments: boolean;
  hasImages: boolean;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// Priority styling
const getPriorityStyles = (priority: string) => {
  switch (priority) {
    case "URGENT":
      return "bg-red-100 text-red-800 border-red-200";
    case "HIGH":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "NORMAL":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "LOW":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Category display names
const getCategoryDisplay = (category: string) => {
  const categoryMap: Record<string, string> = {
    GENERAL_ANNOUNCEMENT: "General",
    EVENT_UPDATE: "Event Update",
    REGISTRATION_UPDATE: "Registration",
    PAYMENT_UPDATE: "Payment",
    TEAM_UPDATE: "Team",
    SYSTEM_MAINTENANCE: "System",
    URGENT_NOTICE: "Urgent"
  };
  
  return categoryMap[category] || category;
};

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { readAnnouncements, markAnnouncementAsRead } = useNotification();
  const router = useRouter();

  // Fetch announcements when panel opens
  useEffect(() => {
    if (isOpen && announcements.length === 0) {
      fetchAnnouncements();
    }
  }, [isOpen]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/announcements/public?limit=20');
      const data = await response.json();
      
      if (data.success) {
        setAnnouncements(data.data.announcements);
      } else {
        setError(data.message || 'Failed to fetch announcements');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setAnnouncements([]);
    fetchAnnouncements();
  };

  const markAsRead = (announcementId: string) => {
    markAnnouncementAsRead(announcementId);
  };

  const handleView = (announcement: Announcement) => {
    // Mark as read when viewing
    markAnnouncementAsRead(announcement.id);
    // Navigate to the announcement page
    router.push(`/dashboard/announcement/${announcement.slugId}`);
    // Close the notification panel
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          
          {/* Panel */}
          <motion.div 
            className="fixed right-0 top-0 h-full w-96 bg-background shadow-2xl border-l z-50 flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-background">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <h2 className="font-semibold text-white">Notifications</h2>
            {announcements.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {announcements.length}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="text-xs cursor-pointer"
            >
              Refresh
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onClose}
              className="h-8 w-8 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

            {/* Content */}
            <ScrollArea className="flex-1">
              <div className="p-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-600 text-sm mb-2">{error}</p>
                    <Button variant="outline" size="sm" onClick={handleRefresh}>
                      Try Again
                    </Button>
                  </div>
                ) : announcements.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-white text-sm">No announcements yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {announcements.map((announcement, index) => (
                      <div key={announcement.id}>
                        <div className="space-y-3">
                          {/* Header with priority and category */}
                          <div className="flex items-center justify-between">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getPriorityStyles(announcement.priority)}`}
                            >
                              {announcement.priority}
                            </Badge>
                            <span className="text-xs text-gray-50/70">
                              {getCategoryDisplay(announcement.category)}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="font-medium text-white text-sm leading-5">
                            {announcement.title}
                          </h3>

                          {/* Related Event */}
                          {announcement.relatedEvent && (
                            <div className="flex items-center gap-1 text-xs text-blue-600">
                              <Calendar className="h-3 w-3" />
                              <span>{announcement.relatedEvent.title}</span>
                            </div>
                          )}

                          {/* Attachments indicator */}
                          {(announcement.hasAttachments || announcement.hasImages) && (
                            <div className="flex items-center gap-2">
                              {announcement.hasAttachments && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Paperclip className="h-3 w-3" />
                                  <span>Files</span>
                                </div>
                              )}
                              {announcement.hasImages && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Image className="h-3 w-3" />
                                  <span>Images</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Timestamp */}
                          <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                            <Clock className="h-3 w-3" />
                            <span title={format(new Date(announcement.createdAt), 'PPpp')}>
                              {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}
                            </span>
                            {announcement.updatedAt !== announcement.createdAt && (
                              <span className="text-orange-500">(Updated)</span>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleView(announcement)}
                              className="text-xs h-7 px-2 flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="h-3 w-3" />
                              View
                            </Button>
                            {!readAnnouncements.has(announcement.id) ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(announcement.id)}
                                className="text-xs h-7 px-2 flex items-center gap-1 text-blue-600 hover:text-blue-700 cursor-pointer"
                              >
                                <Check className="h-3 w-3" />
                                Mark as Read
                              </Button>
                            ) : (
                              <span className="text-xs text-green-600 flex items-center gap-1">
                                <Check className="h-3 w-3" />
                                Read
                              </span>
                            )}
                          </div>
                        </div>

                        {index < announcements.length - 1 && (
                          <Separator className="my-4" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>            {/* Footer */}
            <div className="p-4 border-t bg-background">
              <p className="text-xs text-muted-foreground text-center">
                Stay updated with the latest announcements
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}