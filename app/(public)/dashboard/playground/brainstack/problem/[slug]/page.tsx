"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSession } from "@/lib/auth-client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CodeEditor } from "@/components/brainstack/CodeEditor";
import { ProblemDescription } from "@/components/brainstack/ProblemDescription";
import { TestResults } from "@/components/brainstack/TestResults";
import { SolutionViewer } from "@/components/brainstack/SolutionViewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { executeCode, TestResult } from "@/lib/codeExecution";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function ProblemPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const slug = params.slug as string;

  const problem = useQuery(api.problems.getBySlug, { slug });
  const createSubmission = useMutation(api.submissions.create);
  const updateProblemStats = useMutation(api.problems.updateStats);

  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [submissionStatus, setSubmissionStatus] = useState<any>(undefined);
  const [isRunning, setIsRunning] = useState(false);

  if (!session?.user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Please log in</h2>
          <p className="text-muted-foreground">You need to be logged in to solve problems</p>
        </div>
      </div>
    );
  }

  if (problem === undefined) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (problem === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Problem not found</h2>
          <Link href="/dashboard/playground/brainstack">
            <Button>Back to Problems</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleRun = async (code: string, language: string) => {
    setIsRunning(true);
    setTestResults([]);
    setSubmissionStatus(undefined);

    try {
      const result = await executeCode(code, language, problem.testCases, false, problem.solution);
      setTestResults(result.testResults);
      setSubmissionStatus(result.status);
      
      if (result.status === "Accepted") {
        toast.success("All test cases passed!");
      } else {
        toast.error(`Some test cases failed`);
      }
    } catch (error) {
      toast.error("Failed to run code");
      console.error(error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async (code: string, language: string) => {
    setIsRunning(true);
    setTestResults([]);
    setSubmissionStatus(undefined);

    try {
      const result = await executeCode(code, language, problem.testCases, true, problem.solution);
      setTestResults(result.testResults);
      setSubmissionStatus(result.status);

      // Save submission
      await createSubmission({
        problemId: problem._id,
        userId: session.user.id,
        language,
        code,
        status: result.status,
        runtime: result.runtime,
        memory: result.memory,
        testCasesPassed: result.testResults.filter(r => r.passed).length,
        totalTestCases: result.testResults.length,
        errorMessage: result.errorMessage,
      });

      // Update problem stats
      await updateProblemStats({
        problemId: problem._id,
        isAccepted: result.status === "Accepted",
      });

      if (result.status === "Accepted") {
        toast.success("🎉 Accepted! Great job!");
      } else {
        toast.error(`${result.status}`);
      }
    } catch (error) {
      toast.error("Failed to submit code");
      console.error(error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="h-12 border-b flex items-center px-4 gap-4 bg-background">
        <Link href="/dashboard/playground/brainstack">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="font-semibold truncate">{problem.title}</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Desktop: Resizable Panels */}
        <div className="hidden lg:block h-full">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Left Panel - Problem Description */}
            <ResizablePanel defaultSize={40} minSize={25}>
              <ProblemDescription
                title={problem.title}
                difficulty={problem.difficulty}
                description={problem.description}
                examples={problem.examples}
                constraints={problem.constraints}
                tags={problem.tags}
              />
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Right Panel - Code Editor */}
            <ResizablePanel defaultSize={60} minSize={35}>
              <ResizablePanelGroup direction="vertical">
                {/* Editor Section */}
                <ResizablePanel defaultSize={50} minSize={30}>
                  <CodeEditor
                    starterCode={problem.starterCode}
                    onRun={handleRun}
                    onSubmit={handleSubmit}
                    isRunning={isRunning}
                  />
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Test Results Section */}
                <ResizablePanel defaultSize={50} minSize={20}>
                  <Tabs defaultValue="testcases" className="h-full flex flex-col">
                    <TabsList className="mx-4 mt-2 w-auto">
                      <TabsTrigger value="testcases">Test Cases</TabsTrigger>
                      <TabsTrigger value="solution">Solution</TabsTrigger>
                      <TabsTrigger value="submissions">Submissions</TabsTrigger>
                    </TabsList>
                    <TabsContent value="testcases" className="flex-1 mt-0 overflow-hidden">
                      <TestResults
                        results={testResults}
                        status={submissionStatus}
                        isLoading={isRunning}
                      />
                    </TabsContent>
                    <TabsContent value="solution" className="flex-1 mt-0 overflow-hidden">
                      <SolutionViewer solution={problem.solution} />
                    </TabsContent>
                    <TabsContent value="submissions" className="flex-1 mt-0 p-4 overflow-auto">
                      <div className="text-sm text-muted-foreground">
                        Submission history will appear here
                      </div>
                    </TabsContent>
                  </Tabs>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        {/* Mobile: Tab-based Layout */}
        <div className="lg:hidden h-full flex flex-col">
          <Tabs defaultValue="code" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-4 rounded-none border-b">
              <TabsTrigger value="description">Problem</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
              <TabsTrigger value="testcases">Test</TabsTrigger>
              <TabsTrigger value="solution">Solution</TabsTrigger>
            </TabsList>

            {/* Problem Description Tab */}
            <TabsContent value="description" className="flex-1 mt-0 overflow-auto">
              <ProblemDescription
                title={problem.title}
                difficulty={problem.difficulty}
                description={problem.description}
                examples={problem.examples}
                constraints={problem.constraints}
                tags={problem.tags}
              />
            </TabsContent>

            {/* Code Editor Tab */}
            <TabsContent value="code" className="flex-1 mt-0 flex flex-col">
              <div className="flex-1">
                <CodeEditor
                  starterCode={problem.starterCode}
                  onRun={handleRun}
                  onSubmit={handleSubmit}
                  isRunning={isRunning}
                />
              </div>
            </TabsContent>

            {/* Test Cases Tab */}
            <TabsContent value="testcases" className="flex-1 mt-0 overflow-hidden">
              <TestResults
                results={testResults}
                status={submissionStatus}
                isLoading={isRunning}
              />
            </TabsContent>

            {/* Solution Tab */}
            <TabsContent value="solution" className="flex-1 mt-0 overflow-hidden">
              <SolutionViewer solution={problem.solution} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
