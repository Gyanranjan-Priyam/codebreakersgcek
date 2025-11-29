"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  MessageCircle, 
  Paperclip,
  FileText,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import { getUserSupportTickets } from "../actions";
import { formatDistanceToNow } from "date-fns";

interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  message: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  createdAt: Date;
  updatedAt: Date;
  attachments: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  }>;
  _count: {
    responses: number;
  };
}

const statusConfig = {
  OPEN: {
    label: "Open",
    icon: Clock,
    variant: "default" as const,
    color: "text-blue-600",
  },
  IN_PROGRESS: {
    label: "In Progress", 
    icon: AlertCircle,
    variant: "secondary" as const,
    color: "text-yellow-600",
  },
  RESOLVED: {
    label: "Resolved",
    icon: CheckCircle,
    variant: "outline" as const,
    color: "text-green-600",
  },
  CLOSED: {
    label: "Closed",
    icon: CheckCircle,
    variant: "outline" as const,
    color: "text-gray-600",
  },
};

const priorityConfig = {
  LOW: { label: "Low", variant: "outline" as const },
  MEDIUM: { label: "Medium", variant: "secondary" as const },
  HIGH: { label: "High", variant: "default" as const },
  URGENT: { label: "Urgent", variant: "destructive" as const },
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function SupportTicketsList() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTickets = async () => {
    try {
      const result = await getUserSupportTickets();
      if (result.status === "success") {
        setTickets(result.data);
      }
    } catch (error) {
      console.error("Failed to load support tickets:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadTickets();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-5 w-32" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Separator />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg">Your Support Tickets</CardTitle>
          <CardDescription>
            Track the status of your support requests
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {tickets.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Support Tickets</h3>
            <p className="text-muted-foreground">
              You haven't submitted any support requests yet. Create one above if you need assistance.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] w-full pr-4">
            <div className="space-y-6">
              {tickets.map((ticket) => {
                const statusInfo = statusConfig[ticket.status];
                const priorityInfo = priorityConfig[ticket.priority];
                const StatusIcon = statusInfo.icon;

                return (
                  <div key={ticket.id} className="border rounded-lg p-4 space-y-4">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {ticket.ticketNumber}
                        </code>
                        <Badge variant={statusInfo.variant}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                        <Badge variant={priorityInfo.variant}>
                          {priorityInfo.label}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Created {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                      </div>
                    </div>

                    {/* Subject and Message */}
                    <div>
                      <h4 className="font-semibold text-sm mb-2">{ticket.subject}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {ticket.message}
                      </p>
                    </div>

                    {/* Attachments */}
                    {ticket.attachments.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Paperclip className="h-3 w-3" />
                          <span>{ticket.attachments.length} attachment{ticket.attachments.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {ticket.attachments.map((attachment) => (
                            <div
                              key={attachment.id}
                              className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded"
                            >
                              <FileText className="h-3 w-3" />
                              <span className="truncate max-w-[120px]">
                                {attachment.fileName}
                              </span>
                              <span className="text-muted-foreground">
                                ({formatFileSize(attachment.fileSize)})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {ticket._count.responses > 0 && (
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            <span>{ticket._count.responses} response{ticket._count.responses !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                        <span>
                          Updated {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}