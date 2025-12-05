"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, Github, ExternalLink, MessageSquare } from "lucide-react";
import { ReviewProjectDialog } from "./review-project-dialog";
import { CollaborationDialog } from "./collaboration-dialog";
import { PublishFromReviewDialog } from "./publish-from-review-dialog";

interface Review {
  id: string;
  userId: string;
  repoName: string;
  repoUrl: string;
  description: string;
  reviewType: string;
  explanation: string;
  liveUrl: string | null;
  whatsappNumber: string | null;
  status: string;
  adminResponse: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    githubUsername: string | null;
    whatsappNumber: string | null;
  };
}

interface ReviewsListProps {
  reviews: Review[];
}

export function ReviewsList({ reviews }: ReviewsListProps) {
  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No submissions found in this category
        </CardContent>
      </Card>
    );
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getReviewTypeBadge = (type: string) => {
    switch (type) {
      case "review":
        return <Badge variant="secondary">For Review</Badge>;
      case "collaboration":
        return <Badge variant="default" className="bg-blue-600">For Collaboration</Badge>;
      case "publish":
        return <Badge variant="default" className="bg-green-600">For Publish</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="border-yellow-600 text-yellow-600">Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="border-green-600 text-green-600">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="border-red-600 text-red-600">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="space-y-2 flex-1">
                <div className="flex items-center flex-wrap gap-2">
                  <CardTitle className="text-lg">{review.repoName}</CardTitle>
                  {getReviewTypeBadge(review.reviewType)}
                  {getStatusBadge(review.status)}
                </div>
                <CardDescription className="line-clamp-2">
                  {review.description || "No description provided"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* User Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{review.user.name}</span>
              </div>
              {review.user.githubUsername && (
                <div className="flex items-center gap-2">
                  <Github className="h-4 w-4 text-muted-foreground" />
                  <span>@{review.user.githubUsername}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(review.createdAt)}</span>
              </div>
            </div>

            {/* Explanation Preview */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-1">Explanation:</p>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {review.explanation}
              </p>
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <a href={review.repoUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
                  <Github className="h-3.5 w-3.5" />
                  View Repo
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
              {review.liveUrl && (
                <Button asChild size="sm" variant="outline">
                  <a href={review.liveUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Live Demo
                  </a>
                </Button>
              )}
            </div>

            {/* Admin Response */}
            {review.adminResponse && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  <p className="text-sm font-medium text-blue-600">Admin Response:</p>
                </div>
                <p className="text-sm text-muted-foreground">{review.adminResponse}</p>
              </div>
            )}

            {/* Action Buttons */}
            {review.status === "pending" && (
              <div className="flex flex-wrap gap-2 pt-2">
                {review.reviewType === "review" && (
                  <ReviewProjectDialog review={review} />
                )}
                {review.reviewType === "collaboration" && (
                  <CollaborationDialog review={review} />
                )}
                {review.reviewType === "publish" && (
                  <PublishFromReviewDialog review={review} />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
