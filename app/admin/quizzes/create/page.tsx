import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import CreateQuizForm from "./_components/create-quiz-form";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function CreateQuizPage() {
  const session = await auth.api.getSession({
    headers: await import("next/headers").then(m => m.headers()),
  });

  if (!session?.user?.id) {
    redirect("/admin/quizzes");
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/quizzes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Create New Quiz
          </h1>
          <p className="text-muted-foreground mt-2">
            Fill in the details to create a new quiz
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quiz Details</CardTitle>
          <CardDescription>
            Enter the quiz information and questions in JSON format
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateQuizForm userId={session.user.id} />
        </CardContent>
      </Card>
    </div>
  );
}
