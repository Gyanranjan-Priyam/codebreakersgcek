import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getQuizByQuizId } from "../../actions";
import { notFound } from "next/navigation";
import EditQuizForm from "./_components/edit-quiz-form";

export default async function EditQuizPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params;
  const result = await getQuizByQuizId(quizId);

  if (result.status === "error" || !result.data) {
    notFound();
  }

  const quiz = result.data;

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Edit Quiz
          </h1>
          <p className="text-muted-foreground mt-2">
            Update quiz details and questions
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quiz Details</CardTitle>
          <CardDescription>
            Make changes to the quiz information and questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditQuizForm quiz={quiz} />
        </CardContent>
      </Card>
    </div>
  );
}
