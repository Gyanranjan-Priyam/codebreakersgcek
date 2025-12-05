"use client";

import { useState, useTransition } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Loader2, CheckCircle, XCircle } from "lucide-react";
import { updateProjectReviewStatus } from "../actions";
import { toast } from "sonner";

interface ReviewProjectDialogProps {
  review: {
    id: string;
    repoName: string;
    explanation: string;
    liveUrl: string | null;
  };
}

export function ReviewProjectDialog({ review }: ReviewProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [remark, setRemark] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleApprove = () => {
    startTransition(async () => {
      try {
        const result = await updateProjectReviewStatus({
          reviewId: review.id,
          status: "approved",
          adminResponse: remark.trim() || "Reviewed and approved",
        });

        if (result.success) {
          toast.success(result.message);
          setOpen(false);
          setRemark("");
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error("Failed to approve project");
        console.error(error);
      }
    });
  };

  const handleReject = () => {
    if (!remark.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateProjectReviewStatus({
          reviewId: review.id,
          status: "rejected",
          adminResponse: remark.trim(),
        });

        if (result.success) {
          toast.success(result.message);
          setOpen(false);
          setRemark("");
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
        <Button size="sm" variant="default" className="gap-2">
          <MessageSquare className="h-3.5 w-3.5" />
          Review
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Project: {review.repoName}</DialogTitle>
          <DialogDescription>
            Provide feedback and decide whether to approve or reject this submission
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Project Explanation */}
          <div className="space-y-2">
            <Label>Student's Explanation</Label>
            <div className="p-3 bg-muted/50 rounded-lg border">
              <p className="text-sm whitespace-pre-wrap">{review.explanation}</p>
            </div>
          </div>

          {review.liveUrl && (
            <div className="space-y-2">
              <Label>Live URL</Label>
              <div className="p-3 bg-muted/50 rounded-lg border">
                <a
                  href={review.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  {review.liveUrl}
                </a>
              </div>
            </div>
          )}

          {/* Admin Remark */}
          <div className="space-y-2">
            <Label htmlFor="remark">Your Remark (Optional for approval, required for rejection)</Label>
            <Textarea
              id="remark"
              placeholder="Provide your feedback, suggestions, or reason for rejection..."
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              rows={5}
              className="resize-none"
            />
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
            onClick={handleApprove}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Approving...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
