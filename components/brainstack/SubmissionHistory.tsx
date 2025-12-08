"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, XCircle, Clock, Code2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SubmissionHistoryProps {
  userId: string;
  problemId: Id<"problems">;
}

export function SubmissionHistory({ userId, problemId }: SubmissionHistoryProps) {
  const submissions = useQuery(api.submissions.listByUserAndProblem, {
    userId,
    problemId,
  });

  if (submissions === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <Code2 className="w-12 h-12 text-muted-foreground mb-3" />
        <h3 className="font-semibold text-lg mb-1">No Submissions Yet</h3>
        <p className="text-sm text-muted-foreground">
          Submit your code to see your submission history here
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-3">
        {submissions.map((submission, index) => {
          const isAccepted = submission.status === "Accepted";
          const statusColor = isAccepted
            ? "text-green-500"
            : submission.status === "Wrong Answer"
            ? "text-red-500"
            : "text-yellow-500";

          const StatusIcon = isAccepted
            ? CheckCircle2
            : submission.status === "Pending"
            ? Clock
            : XCircle;

          return (
            <Card key={submission._id} className="p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <StatusIcon className={`w-5 h-5 mt-0.5 ${statusColor}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-semibold ${statusColor}`}>
                        {submission.status}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {submission.language}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-2">
                      {formatDistanceToNow(submission.submittedAt, { addSuffix: true })}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        Test Cases: {submission.testCasesPassed}/{submission.totalTestCases}
                      </span>
                      {submission.runtime && (
                        <span>Runtime: {submission.runtime}ms</span>
                      )}
                      {submission.memory && (
                        <span>Memory: {(submission.memory / 1024).toFixed(1)}KB</span>
                      )}
                    </div>

                    {submission.errorMessage && (
                      <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-500">
                        {submission.errorMessage}
                      </div>
                    )}
                  </div>
                </div>

                {index === 0 && (
                  <Badge variant="secondary" className="text-xs">
                    Latest
                  </Badge>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
}
