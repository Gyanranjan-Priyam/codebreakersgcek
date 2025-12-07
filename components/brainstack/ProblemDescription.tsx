"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface Example {
  input: string;
  output: string;
  explanation?: string;
}

interface ProblemDescriptionProps {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  examples: Example[];
  constraints?: string;
  tags: string[];
}

export function ProblemDescription({
  title,
  difficulty,
  description,
  examples,
  constraints,
  tags,
}: ProblemDescriptionProps) {
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "Easy":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "Hard":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <div className="h-full overflow-auto p-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={cn("border", getDifficultyColor(difficulty))}>
            {difficulty}
          </Badge>
          {tags.map((tag, idx) => (
            <Badge key={idx} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </CardContent>
      </Card>

      {/* Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {examples.map((example, idx) => (
            <div key={idx} className="border rounded-lg p-4 space-y-2">
              <div className="font-semibold">Example {idx + 1}:</div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Input:</div>
                <pre className="bg-muted p-2 rounded text-sm mt-1 overflow-x-auto">
                  {example.input}
                </pre>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Output:</div>
                <pre className="bg-muted p-2 rounded text-sm mt-1 overflow-x-auto">
                  {example.output}
                </pre>
              </div>
              {example.explanation && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Explanation:</div>
                  <p className="text-sm mt-1">{example.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Constraints */}
      {constraints && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Constraints</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: constraints }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
