"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSession } from "@/lib/auth-client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Database, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function SeedPage() {
  const { data: session } = useSession();
  const seedProblems = useMutation(api.seedLargeDataset.seedLargeDataset);
  const [isSeeding, setIsSeeding] = useState(false);
  const [result, setResult] = useState<{ message: string; success: boolean } | null>(null);

  const handleSeed = async () => {
    if (!session?.user?.id) {
      toast.error("You must be logged in to seed problems");
      return;
    }

    setIsSeeding(true);
    setResult(null);

    try {
      const response = await seedProblems({ userId: session.user.id });
      setResult({ message: response.message, success: true });
      toast.success(response.message);
    } catch (error: any) {
      const errorMsg = error.message || "Failed to seed problems";
      setResult({ message: errorMsg, success: false });
      toast.error(errorMsg);
    } finally {
      setIsSeeding(false);
    }
  };

  if (!session?.user) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Please log in</h2>
          <p className="text-muted-foreground">You need to be logged in to access this page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Database className="w-8 h-8 text-primary" />
            <div>
              <CardTitle>Seed Brainstack Problems</CardTitle>
              <CardDescription>
                Populate the database with 500+ LeetCode-style coding problems
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <p className="text-sm font-medium mb-2">⚠️ Important</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>This will add 500+ coding problems to your database</li>
              <li>Only run this once - it will skip if problems already exist</li>
              <li>The process may take 30-60 seconds to complete</li>
              <li>Problems include multiple difficulty levels and categories</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              size="lg"
              onClick={handleSeed}
              disabled={isSeeding}
              className="w-full"
            >
              {isSeeding ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Seeding Database...
                </>
              ) : (
                <>
                  <Database className="w-5 h-5 mr-2" />
                  Seed Problems
                </>
              )}
            </Button>

            {result && (
              <Card className={result.success ? "border-green-500/50" : "border-red-500/50"}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    {result.success ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium">{result.success ? "Success!" : "Error"}</p>
                      <p className="text-sm text-muted-foreground">{result.message}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">What will be seeded:</h3>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-green-500">~200</div>
                  <div className="text-muted-foreground">Easy Problems</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-yellow-500">~250</div>
                  <div className="text-muted-foreground">Medium Problems</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-red-500">~50</div>
                  <div className="text-muted-foreground">Hard Problems</div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>Categories include:</p>
            <p className="mt-1">
              Array, String, Linked List, Tree, Dynamic Programming, Graph, Math, 
              Sorting, Binary Search, Backtracking, and more...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
