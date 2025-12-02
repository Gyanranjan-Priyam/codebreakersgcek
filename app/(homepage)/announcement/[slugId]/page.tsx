import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Calendar, Clock, FileText, Image, ArrowLeft, AlertCircle, Info, TrendingUp, Users } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { RenderDescription } from "@/components/admin_components/rich-text-editor/RenderDescription";
import { type JSONContent } from "@tiptap/react";
import { prisma } from "@/lib/db";

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

async function getAnnouncement(slugId: string): Promise<AnnouncementData | null> {
  try {
    const announcement = await prisma.announcement.findUnique({
      where: { slugId },
    });

    if (!announcement) {
      return null;
    }

    return {
      id: announcement.id,
      slugId: announcement.slugId,
      title: announcement.title,
      description: announcement.description as JSONContent | string,
      category: announcement.category,
      priority: announcement.priority as "LOW" | "NORMAL" | "HIGH" | "URGENT",
      createdAt: announcement.createdAt.toISOString(),
      updatedAt: announcement.updatedAt.toISOString(),
      attachmentKeys: announcement.attachmentKeys || [],
      imageKeys: announcement.imageKeys || [],
      createdBy: announcement.createdBy,
    };
  } catch (error) {
    console.error('Error fetching announcement:', error);
    return null;
  }
}

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

function SafeDescriptionRenderer({ description }: { description: any }) {
  if (typeof description === 'string') {
    try {
      const parsed = JSON.parse(description);
      if (parsed && typeof parsed === 'object' && (parsed.type || parsed.content)) {
        return <RenderDescription json={parsed} />;
      }
    } catch {
      return <p className="text-foreground">{description}</p>;
    }
    return <p className="text-foreground">{description}</p>;
  }

  if (description && typeof description === 'object') {
    if (description.type || description.content) {
      return <RenderDescription json={description} />;
    }
    
    const textContent = JSON.stringify(description);
    return <p className="text-muted-foreground">Content format not supported: {textContent}</p>;
  }

  return <p className="text-muted-foreground">No description available</p>;
}

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

export default async function AnnouncementPage({ params }: { params: Promise<{ slugId: string }> }) {
  const { slugId } = await params;
  const announcement = await getAnnouncement(slugId);

  if (!announcement) {
    notFound();
  }

  const priorityStyle = getPriorityStyles(announcement.priority);
  const PriorityIcon = priorityStyle.icon;

  return (
    <div className="container mx-auto px-4 py-6 bg-black">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 items-center">
            <div className="flex items-center justify-between gap-2 mb-3">
               <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
              {announcement.title}
            </h1>
            </div>

          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>
              Published {format(new Date(announcement.createdAt), 'PPP')}
            </span>
          </div>
          
          {announcement.updatedAt !== announcement.createdAt && (
            <div className="flex items-center gap-1">
              <span className="text-orange-600">•</span>
              <span>Updated {format(new Date(announcement.updatedAt), 'PPP')}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>ID: {announcement.slugId}</span>
          </div>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader className="flex flex-col items-center justify-center">
              <CardTitle className="text-2xl">Announcement Details</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <SafeDescriptionRenderer description={announcement.description} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Priority</span>
                <Badge variant="outline" className={`text-xs ${priorityStyle.badge}`}>
                  {announcement.priority}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Category</span>
                <Badge variant="secondary" className="text-xs">
                  {getCategoryDisplay(announcement.category)}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Published</span>
                <span className="text-xs">
                  {format(new Date(announcement.createdAt), 'dd/MM/yyyy')}
                </span>
              </div>
              
              {announcement.updatedAt !== announcement.createdAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last Updated</span>
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
              <CardHeader>
                <CardTitle className="text-lg">Attachments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {announcement.attachmentKeys.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Files</span>
                      <Badge variant="secondary" className="text-xs">
                        {announcement.attachmentKeys.length}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {announcement.attachmentKeys.map((key, index) => (
                        <Button key={key} variant="outline" size="sm" className="w-full justify-start text-xs">
                          <FileText className="h-3 w-3 mr-2" />
                          Attachment {index + 1}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                {announcement.imageKeys.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Image className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Images</span>
                      <Badge variant="secondary" className="text-xs">
                        {announcement.imageKeys.length}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {announcement.imageKeys.map((key, index) => (
                        <Button key={key} variant="outline" size="sm" className="w-full justify-start text-xs">
                          <Image className="h-3 w-3 mr-2" />
                          Image {index + 1}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
