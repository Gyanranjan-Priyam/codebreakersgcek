"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSession } from "@/lib/auth-client";
import { ProblemList } from "@/components/brainstack/ProblemList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, CheckCircle2, Clock, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function BrainstackPage() {
  const { data: session } = useSession();
  const problems = useQuery(
    api.problems.listWithProgress,
    session?.user?.id ? { userId: session.user.id } : "skip"
  );
  const stats = useQuery(
    api.userProgress.getStats,
    session?.user?.id ? { userId: session.user.id } : "skip"
  );

  if (!session?.user) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Please log in</h2>
          <p className="text-muted-foreground">You need to be logged in to access Brainstack</p>
        </div>
      </div>
    );
  }

  const easyProblems = problems?.filter(p => p.difficulty === "Easy") || [];
  const mediumProblems = problems?.filter(p => p.difficulty === "Medium") || [];
  const hardProblems = problems?.filter(p => p.difficulty === "Hard") || [];

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl tracking-tight font-bold flex items-center gap-3">
          <Brain className="w-8 h-8 text-primary" />
          Brainstack
        </h1>
        <p className="text-muted-foreground mt-2">
          Sharpen your coding skills with LeetCode-style problems
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Problems Solved</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              {stats === undefined ? (
                <Skeleton className="h-9 w-16" />
              ) : (
                <>
                  <CheckCircle2 className="w-7 h-7 text-green-500" />
                  {stats.totalSolved}
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {stats && `Out of ${stats.totalProblems} total problems`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Attempted</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              {stats === undefined ? (
                <Skeleton className="h-9 w-16" />
              ) : (
                <>
                  <Clock className="w-7 h-7 text-yellow-500" />
                  {stats.totalAttempted}
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Keep practicing to improve
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Success Rate</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              {stats === undefined ? (
                <Skeleton className="h-9 w-16" />
              ) : (
                <>
                  <Trophy className="w-7 h-7 text-primary" />
                  {stats.totalAttempted > 0 
                    ? Math.round((stats.totalSolved / stats.totalAttempted) * 100) 
                    : 0}%
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Your solving efficiency
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Problems List */}
      <Card>
        <CardHeader>
          <CardTitle>Problems</CardTitle>
          <CardDescription>
            Choose a problem to start coding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">
                All ({problems?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="easy">
                Easy ({easyProblems.length})
              </TabsTrigger>
              <TabsTrigger value="medium">
                Medium ({mediumProblems.length})
              </TabsTrigger>
              <TabsTrigger value="hard">
                Hard ({hardProblems.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              {problems === undefined ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : problems.length === 0 ? (
                <div className="text-center py-12">
                  <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Problems Yet</h3>
                  <p className="text-muted-foreground">
                    The database needs to be populated with coding problems.
                  </p>
                </div>
              ) : (
                <ProblemList problems={problems} />
              )}
            </TabsContent>

            <TabsContent value="easy" className="mt-4">
              {easyProblems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No easy problems available. Please seed the database first.
                </div>
              ) : (
                <ProblemList problems={easyProblems} />
              )}
            </TabsContent>

            <TabsContent value="medium" className="mt-4">
              {mediumProblems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No medium problems available. Please seed the database first.
                </div>
              ) : (
                <ProblemList problems={mediumProblems} />
              )}
            </TabsContent>

            <TabsContent value="hard" className="mt-4">
              {hardProblems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hard problems available. Please seed the database first.
                </div>
              ) : (
                <ProblemList problems={hardProblems} />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
