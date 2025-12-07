"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TestResult {
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  error?: string;
}

interface TestResultsProps {
  results: TestResult[];
  status?: "Accepted" | "Wrong Answer" | "Runtime Error" | "Compilation Error" | "Time Limit Exceeded" | "Pending";
  runtime?: number;
  memory?: number;
  isLoading?: boolean;
}

export function TestResults({ results, status, runtime, memory, isLoading }: TestResultsProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "Accepted":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "Wrong Answer":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "Runtime Error":
      case "Compilation Error":
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case "Time Limit Exceeded":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "Accepted":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Wrong Answer":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "Runtime Error":
      case "Compilation Error":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "Time Limit Exceeded":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Running tests...</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Run or submit your code to see test results
      </div>
    );
  }

  return (
    <ScrollArea className="h-full p-4">
      <div className="space-y-4">
        {/* Status Summary */}
        {status && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                {getStatusIcon()}
                <Badge className={`border ${getStatusColor()}`}>
                  {status}
                </Badge>
              </div>
              {(runtime !== undefined || memory !== undefined) && (
                <div className="flex gap-6 text-sm">
                  {runtime !== undefined && (
                    <div>
                      <span className="text-muted-foreground">Runtime:</span>
                      <span className="ml-2 font-medium">{runtime}ms</span>
                    </div>
                  )}
                  {memory !== undefined && (
                    <div>
                      <span className="text-muted-foreground">Memory:</span>
                      <span className="ml-2 font-medium">{(memory / 1024).toFixed(2)}MB</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Test Cases */}
        {results.map((result, idx) => (
          <Card key={idx} className={result.passed ? "border-green-500/50" : "border-red-500/50"}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                {result.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                Test Case {idx + 1}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <div className="font-medium text-muted-foreground mb-1">Input:</div>
                <pre className="bg-muted p-2 rounded overflow-x-auto">
                  {result.input}
                </pre>
              </div>
              <div>
                <div className="font-medium text-muted-foreground mb-1">Expected Output:</div>
                <pre className="bg-muted p-2 rounded overflow-x-auto">
                  {result.expectedOutput}
                </pre>
              </div>
              {result.actualOutput && (
                <div>
                  <div className="font-medium text-muted-foreground mb-1">Your Output:</div>
                  <pre className={`p-2 rounded overflow-x-auto ${
                    result.passed ? "bg-green-500/10" : "bg-red-500/10"
                  }`}>
                    {result.actualOutput}
                  </pre>
                </div>
              )}
              {result.error && (
                <div>
                  <div className="font-medium text-red-500 mb-1">Error:</div>
                  <pre className="bg-red-500/10 p-2 rounded overflow-x-auto text-red-500">
                    {result.error}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
