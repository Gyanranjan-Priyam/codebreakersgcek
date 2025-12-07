"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Code2, CheckCircle2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const LANGUAGE_MAP: Record<string, string> = {
  cpp: "C++",
  java: "Java",
  python: "Python 2",
  python3: "Python 3",
  c: "C",
  csharp: "C#",
  javascript: "JavaScript",
  typescript: "TypeScript",
};

interface SolutionViewerProps {
  solution?: Record<string, string | undefined>;
}

export function SolutionViewer({ solution }: SolutionViewerProps) {
  const [showSolution, setShowSolution] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");

  if (!solution) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground py-8">
            <Code2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No solution available for this problem yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const availableLanguages = Object.keys(solution).filter(
    (lang) => solution[lang] !== undefined && solution[lang]?.trim() !== ""
  );

  if (availableLanguages.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground py-8">
            <Code2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No solution available for this problem yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Set initial language to first available
  if (!availableLanguages.includes(selectedLanguage) && availableLanguages.length > 0) {
    setSelectedLanguage(availableLanguages[0]);
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        <Card className="border-primary/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Official Solution
              </CardTitle>
              <Button
                size="sm"
                variant={showSolution ? "destructive" : "default"}
                onClick={() => setShowSolution(!showSolution)}
              >
                {showSolution ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Hide Solution
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Show Solution
                  </>
                )}
              </Button>
            </div>
          </CardHeader>

          {showSolution && (
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLanguages.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {LANGUAGE_MAP[lang] || lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge variant="secondary">Optimal Solution</Badge>
              </div>

              <div className="bg-muted rounded-lg">
                <pre className="p-4 overflow-x-auto text-sm">
                  <code>{solution[selectedLanguage]}</code>
                </pre>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">
                  💡 Tip
                </p>
                <p className="text-sm text-muted-foreground">
                  Try to solve the problem on your own first before viewing the solution.
                  Learning is most effective when you struggle through the problem yourself!
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </ScrollArea>
  );
}
