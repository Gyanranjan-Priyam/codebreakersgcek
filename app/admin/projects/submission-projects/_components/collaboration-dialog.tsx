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
import { Users, Loader2, CheckCircle, XCircle } from "lucide-react";
import { approveForCollaboration, updateProjectReviewStatus } from "../actions";
import { toast } from "sonner";

interface CollaborationDialogProps {
  review: {
    id: string;
    repoName: string;
    explanation: string;
  };
}

export function CollaborationDialog({ review }: CollaborationDialogProps) {
  const [open, setOpen] = useState(false);
  const [response, setResponse] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleApprove = () => {
    startTransition(async () => {
      try {
        const result = await approveForCollaboration({
          reviewId: review.id,
          adminResponse: response.trim() || "Approved for collaboration",
        });

        if (result.success) {
          toast.success(result.message);
          setOpen(false);
          setResponse("");
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error("Failed to approve for collaboration");
        console.error(error);
      }
    });
  };

  const handleReject = () => {
    if (!response.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateProjectReviewStatus({
          reviewId: review.id,
          status: "rejected",
          adminResponse: response.trim(),
        });

        if (result.success) {
          toast.success(result.message);
          setOpen(false);
          setResponse("");
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
        <Button size="sm" variant="default" className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Users className="h-3.5 w-3.5" />
          Review Collaboration
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Collaboration Request: {review.repoName}</DialogTitle>
          <DialogDescription>
            Review this collaboration request and decide whether to approve it for the collaborative projects section
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Project Explanation */}
          <div className="space-y-2">
            <Label>Collaboration Details</Label>
            <div className="p-3 bg-muted/50 rounded-lg border">
              <p className="text-sm whitespace-pre-wrap">{review.explanation}</p>
            </div>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-sm mb-2">What happens when approved?</h4>
            <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
              <li>Project will appear in the Collaborative Projects section</li>
              <li>Other students can view and request to collaborate</li>
              <li>Project owner will be notified of collaboration requests</li>
            </ul>
          </div>

          {/* Admin Response */}
          <div className="space-y-2">
            <Label htmlFor="response">Your Response (Optional)</Label>
            <Textarea
              id="response"
              placeholder="Provide feedback or guidance for the collaboration..."
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={4}
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
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Approving...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve for Collaboration
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
