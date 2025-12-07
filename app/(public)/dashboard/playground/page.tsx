import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Code2, Trophy, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PlaygroundPage() {
  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl sm:text-3xl tracking-tight font-bold">Playground</h1>
        <p className="text-muted-foreground mt-2">
          Here you can get hands-on experience with coding challenges and experiments. And also interact with various coding tools and resources.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Brainstack Card */}
        <Card className="hover:shadow-lg transition-shadow border-primary/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Brainstack</CardTitle>
                  <CardDescription>
                    LeetCode-style coding challenges
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3 mb-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Code2 className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-sm font-medium">Multiple Languages</div>
                  <div className="text-xs text-muted-foreground">C++, Java, Python, C#, JS, TS</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <div>
                  <div className="text-sm font-medium">Track Progress</div>
                  <div className="text-xs text-muted-foreground">Monitor your improvement</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <div>
                  <div className="text-sm font-medium">Difficulty Levels</div>
                  <div className="text-xs text-muted-foreground">Easy, Medium, Hard</div>
                </div>
              </div>
            </div>
            <Link href="/dashboard/playground/brainstack">
              <Button className="w-full group">
                Start Solving
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
