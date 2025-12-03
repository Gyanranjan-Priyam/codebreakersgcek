"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { createQuiz } from "../../actions";
import { generateQuizId } from "../../utils";
import { Loader2, CheckCircle2, XCircle, Eye } from "lucide-react";

const formSchema = z.object({
  quizId: z.string().min(1, "Quiz ID is required"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  sets: z.number().min(1).max(8),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  pointsPerQuestion: z.number().min(1, "Points must be at least 1"),
  startDateTime: z.date(),
  endDateTime: z.date(),
  questionsJson: z.string().optional(),
}).refine((data) => {
  return data.endDateTime > data.startDateTime;
}, {
  message: "End date must be after start date",
  path: ["endDateTime"],
});

type FormData = z.infer<typeof formSchema>;

interface CreateQuizFormProps {
  userId: string;
}

export default function CreateQuizForm({ userId }: CreateQuizFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedQuizId, setGeneratedQuizId] = useState("");
  const [setQuestions, setSetQuestions] = useState<Record<string, any[]>>({});
  const [currentSet, setCurrentSet] = useState("A");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewSet, setPreviewSet] = useState<string>("");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quizId: "",
      title: "",
      description: "",
      sets: 1,
      duration: 30,
      pointsPerQuestion: 1,
      startDateTime: new Date(),
      endDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      questionsJson: "",
    },
  });

  // Generate quiz ID on mount
  useEffect(() => {
    const id = generateQuizId();
    setGeneratedQuizId(id);
    form.setValue("quizId", id);
  }, []);

  // Watch sets value to initialize set questions
  const watchSets = form.watch("sets");
  
  useEffect(() => {
    const sets = watchSets;
    const newSetQuestions: Record<string, any[]> = {};
    for (let i = 0; i < sets; i++) {
      const setLetter = String.fromCharCode(65 + i); // A, B, C, etc.
      if (!setQuestions[setLetter]) {
        newSetQuestions[setLetter] = [];
      } else {
        newSetQuestions[setLetter] = setQuestions[setLetter];
      }
    }
    setSetQuestions(newSetQuestions);
    setCurrentSet("A");
  }, [watchSets]);

  // Validate and update questions for current set
  const validateAndUpdateSet = (jsonString: string, setLetter: string) => {
    if (!jsonString.trim()) {
      setJsonError(null);
      return;
    }

    try {
      const parsed = JSON.parse(jsonString);
      
      if (!Array.isArray(parsed)) {
        setJsonError("Questions must be an array");
        return;
      }

      // Validate structure
      const isValid = parsed.every((q: any) => 
        q.id && 
        q.question && 
        Array.isArray(q.options) && 
        q.options.length > 0 &&
        q.answer !== undefined
      );

      if (!isValid) {
        setJsonError("Each question must have: id, question, options array, and answer");
        return;
      }

      // Update set questions
      setSetQuestions(prev => ({
        ...prev,
        [setLetter]: parsed
      }));
      setJsonError(null);
      toast.success(`Questions updated for Set ${setLetter}`);
    } catch (error) {
      setJsonError("Invalid JSON format");
    }
  };

  // Combine all sets into questionsJson
  const combineAllSets = () => {
    const allQuestions: any = {};
    Object.keys(setQuestions).forEach(setLetter => {
      if (setQuestions[setLetter].length > 0) {
        allQuestions[setLetter] = setQuestions[setLetter];
      }
    });
    return JSON.stringify(allQuestions);
  };

  const onSubmit = async (data: FormData) => {
    // Validate that all sets have questions
    const totalQuestions = Object.values(setQuestions).reduce((sum, questions) => sum + questions.length, 0);
    
    if (totalQuestions === 0) {
      toast.error("Please add questions for at least one set");
      return;
    }

    setIsLoading(true);
    const questionsJson = combineAllSets();
    
    const result = await createQuiz({
      ...data,
      questionsJson,
      createdBy: userId,
    });

    if (result.status === "success") {
      toast.success("Quiz created successfully");
      router.push("/admin/quizzes");
    } else {
      toast.error(result.message || "Failed to create quiz");
    }
    setIsLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Quiz ID */}
        <FormField
          control={form.control}
          name="quizId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quiz ID</FormLabel>
              <FormControl>
                <Input {...field} disabled className="font-mono bg-muted" />
              </FormControl>
              <FormDescription>
                Auto-generated unique identifier for this quiz
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., JavaScript Basics Quiz" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description / Rules</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Enter quiz description and rules..."
                  rows={4}
                />
              </FormControl>
              <FormDescription>
                Provide instructions and rules for taking this quiz
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Sets */}
          <FormField
            control={form.control}
            name="sets"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Sets</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value?.toString() || "1"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sets" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? "Set" : "Sets"} (A{num > 1 ? `-${String.fromCharCode(64 + num)}` : ""})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Number of question sets (A, B, C, etc.)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Duration */}
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (minutes)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Time limit for completing the quiz
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Points Per Question */}
          <FormField
            control={form.control}
            name="pointsPerQuestion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Points Per Question</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Points awarded for each correct answer
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Start and End Date Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDateTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date & Time *</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    required
                    value={field.value ? new Date(field.value.getTime() - field.value.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                  />
                </FormControl>
                <FormDescription>
                  When the quiz becomes available
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDateTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date & Time *</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    required
                    value={field.value ? new Date(field.value.getTime() - field.value.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                  />
                </FormControl>
                <FormDescription>
                  When the quiz closes
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Set Tabs for Questions */}
        {watchSets > 0 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Question Sets</h3>
              <p className="text-sm text-muted-foreground">
                Add questions for each set. Each set will be assigned to different members.
              </p>
            </div>

            <Tabs value={currentSet} onValueChange={setCurrentSet}>
              <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${watchSets}, 1fr)` }}>
                {Array.from({ length: watchSets }, (_, i) => {
                  const setLetter = String.fromCharCode(65 + i);
                  const hasQuestions = setQuestions[setLetter]?.length > 0;
                  return (
                    <TabsTrigger key={setLetter} value={setLetter} className="relative">
                      Set {setLetter}
                      {hasQuestions && (
                        <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                          {setQuestions[setLetter].length}
                        </Badge>
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {Array.from({ length: watchSets }, (_, i) => {
                const setLetter = String.fromCharCode(65 + i);
                return (
                  <TabsContent key={setLetter} value={setLetter} className="space-y-4">
                    <Card className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Questions for Set {setLetter}</h4>
                          {setQuestions[setLetter]?.length > 0 && (
                            <Badge variant="default">
                              {setQuestions[setLetter].length} question{setQuestions[setLetter].length > 1 ? "s" : ""}
                            </Badge>
                          )}
                        </div>

                        <Textarea
                          placeholder={`[\n  {\n    "id": 1,\n    "question": "What is 2+2?",\n    "options": ["3", "4", "5", "6"],\n    "answer": "4"\n  }\n]`}
                          rows={8}
                          className="font-mono text-sm"
                          defaultValue={setQuestions[setLetter]?.length > 0 ? JSON.stringify(setQuestions[setLetter], null, 2) : ""}
                          id={`questions-${setLetter}`}
                        />

                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={() => {
                              const textarea = document.getElementById(`questions-${setLetter}`) as HTMLTextAreaElement;
                              validateAndUpdateSet(textarea.value, setLetter);
                            }}
                            variant="secondary"
                            className="flex-1"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Update Questions for Set {setLetter}
                          </Button>

                          {setQuestions[setLetter]?.length > 0 && (
                            <Button
                              type="button"
                              onClick={() => {
                                setPreviewSet(setLetter);
                                setPreviewDialogOpen(true);
                              }}
                              variant="outline"
                              className="flex-1"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Preview ({setQuestions[setLetter].length})
                            </Button>
                          )}
                        </div>

                        {jsonError && currentSet === setLetter && (
                          <div className="flex items-center gap-2 text-destructive text-sm">
                            <XCircle className="h-4 w-4" />
                            {jsonError}
                          </div>
                        )}

                        {/* Quick Preview - First 2 questions */}
                        {setQuestions[setLetter]?.length > 0 && (
                          <div className="border rounded-lg p-3 bg-muted/50">
                            <h5 className="font-medium text-sm mb-2 flex items-center justify-between">
                              <span>Quick Preview</span>
                              <Badge variant="secondary" className="text-xs">
                                {setQuestions[setLetter].length} total
                              </Badge>
                            </h5>
                            <div className="space-y-2">
                              {setQuestions[setLetter].slice(0, 2).map((question: any, index: number) => (
                                <div key={index} className="border-l-2 border-primary pl-3 py-1">
                                  <p className="font-medium text-sm">
                                    {question.id}. {question.question}
                                  </p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {question.options.map((opt: string, i: number) => (
                                      <Badge
                                        key={i}
                                        variant={opt === question.answer ? "default" : "outline"}
                                        className="text-xs"
                                      >
                                        {opt}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              ))}
                              {setQuestions[setLetter].length > 2 && (
                                <p className="text-xs text-muted-foreground text-center pt-1">
                                  Click Preview button to see all {setQuestions[setLetter].length} questions
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>
        )}

        {/* Questions JSON - Hidden field for form submission */}
        <FormField
          control={form.control}
          name="questionsJson"
          render={({ field }) => (
            <FormItem className="hidden">
              <FormControl>
                <Input {...field} type="hidden" />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/quizzes")}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create Quiz
          </Button>
        </div>
      </form>

      {/* Full Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview Questions - Set {previewSet}</DialogTitle>
            <DialogDescription>
              Review all {setQuestions[previewSet]?.length || 0} questions for Set {previewSet}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {setQuestions[previewSet]?.map((question: any, index: number) => (
              <Card key={index} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-0.5">
                      Q{question.id}
                    </Badge>
                    <p className="font-medium flex-1">{question.question}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-12">
                    {question.options.map((opt: string, i: number) => (
                      <div
                        key={i}
                        className={`p-2 rounded-lg border-2 ${
                          opt === question.answer
                            ? "border-primary bg-primary/10"
                            : "border-border bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={opt === question.answer ? "default" : "outline"}
                            className="text-xs"
                          >
                            {String.fromCharCode(65 + i)}
                          </Badge>
                          <span className="text-sm">{opt}</span>
                          {opt === question.answer && (
                            <CheckCircle2 className="h-4 w-4 ml-auto text-primary" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="ml-12 text-sm text-muted-foreground">
                    Correct Answer: <span className="font-medium text-primary">{question.answer}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Form>
  );
}
