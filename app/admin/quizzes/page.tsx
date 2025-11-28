import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getAllQuizzes } from "./actions";
import QuizzesTable from "./_components/quizzes-table";

export default async function AdminQuizzesPage() {
  const result = await getAllQuizzes();
  const quizzes = result.status === "success" ? result.data : [];

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Quiz Management
        </h1>
        <p className="text-muted-foreground mt-2">
          Create and manage quizzes for members
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div className="space-y-1">
            <CardTitle>All Quizzes</CardTitle>
            <CardDescription>
              View and manage all quizzes in the system
            </CardDescription>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/quizzes/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Quiz
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <QuizzesTable quizzes={quizzes} />
        </CardContent>
      </Card>
    </div>
  );
}