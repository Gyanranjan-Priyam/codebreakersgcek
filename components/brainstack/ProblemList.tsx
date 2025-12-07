"use client";

import { Id } from "@/convex/_generated/dataModel";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface Problem {
  _id: Id<"problems">;
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  acceptanceRate?: number;
  userStatus?: "Solved" | "Attempted" | "Not Started";
}

interface ProblemListProps {
  problems: Problem[];
}

export function ProblemList({ problems }: ProblemListProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-500";
      case "Medium":
        return "text-yellow-500";
      case "Hard":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "Solved":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "Attempted":
        return <Circle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Status</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="w-24">Difficulty</TableHead>
            <TableHead className="hidden md:table-cell">Tags</TableHead>
            <TableHead className="w-32 hidden sm:table-cell">Acceptance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {problems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No problems available yet
              </TableCell>
            </TableRow>
          ) : (
            problems.map((problem) => (
              <TableRow key={problem._id} className="hover:bg-muted/50">
                <TableCell>{getStatusIcon(problem.userStatus)}</TableCell>
                <TableCell>
                  <Link 
                    href={`/dashboard/playground/brainstack/problem/${problem.slug}`}
                    className="hover:text-primary font-medium"
                  >
                    {problem.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <span className={cn("font-medium", getDifficultyColor(problem.difficulty))}>
                    {problem.difficulty}
                  </span>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {problem.tags.slice(0, 3).map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {problem.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{problem.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {problem.acceptanceRate ? `${problem.acceptanceRate.toFixed(1)}%` : "N/A"}
                  </span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
