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
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { updateQuiz } from "../../../actions";
import { Loader2, CheckCircle2, XCircle, Eye } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  sets: z.number().min(1).max(8),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  pointsPerQuestion: z.number().min(1, "Points must be at least 1"),
  startDateTime: z.date(),
  endDateTime: z.date(),
  isActive: z.boolean(),
  questionsJson: z.string().optional(),
}).refine((data) => {
  return data.endDateTime > data.startDateTime;
}, {
  message: "End date must be after start date",
  path: ["endDateTime"],
});

type FormData = z.infer<typeof formSchema>;

interface Quiz {
  id: string;
  quizId: string;
  title: string;
  description: string;
  sets: number;
  duration: number;
  pointsPerQuestion: number;
  startDateTime: Date | null;
  endDateTime: Date | null;
  questionsJson: string;
  isActive: boolean;
}

interface EditQuizFormProps {
  quiz: Quiz;
}

export default function EditQuizForm({ quiz }: EditQuizFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [setQuestions, setSetQuestions] = useState<Record<string, any[]>>({});
  const [textareaValues, setTextareaValues] = useState<Record<string, string>>({});
  const [currentSet, setCurrentSet] = useState("A");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewSet, setPreviewSet] = useState<string>("");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: quiz.title,
      description: quiz.description,
      sets: quiz.sets,
      duration: quiz.duration,
      pointsPerQuestion: quiz.pointsPerQuestion,
      startDateTime: quiz.startDateTime ? new Date(quiz.startDateTime) : new Date(),
      endDateTime: quiz.endDateTime ? new Date(quiz.endDateTime) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: quiz.isActive,
      questionsJson: quiz.questionsJson,
    },
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize questions from existing quiz data
  useEffect(() => {
    if (!isInitialized) {
      try {
        const parsedQuestions = JSON.parse(quiz.questionsJson);
        const initialQuestions: Record<string, any[]> = {};
        const initialTextareas: Record<string, string> = {};
        
        if (typeof parsedQuestions === 'object' && !Array.isArray(parsedQuestions)) {
          // Initialize all sets based on quiz.sets
          for (let i = 0; i < quiz.sets; i++) {
            const setLetter = String.fromCharCode(65 + i);
            initialQuestions[setLetter] = parsedQuestions[setLetter] || [];
            initialTextareas[setLetter] = parsedQuestions[setLetter] 
              ? JSON.stringify(parsedQuestions[setLetter], null, 2)
              : "";
          }
        } else if (Array.isArray(parsedQuestions)) {
          // Convert array to set A
          initialQuestions.A = parsedQuestions;
          initialTextareas.A = JSON.stringify(parsedQuestions, null, 2);
          for (let i = 1; i < quiz.sets; i++) {
            const setLetter = String.fromCharCode(65 + i);
            initialQuestions[setLetter] = [];
            initialTextareas[setLetter] = "";
          }
        }
        
        setSetQuestions(initialQuestions);
        setTextareaValues(initialTextareas);
        setIsInitialized(true);
      } catch (error) {
        console.error("Error parsing questions:", error);
        setIsInitialized(true);
      }
    }
  }, [quiz.questionsJson, quiz.sets, isInitialized]);

  // Watch sets value to update set questions when number of sets changes
  const watchSets = form.watch("sets");
  
  useEffect(() => {
    if (isInitialized) {
      const sets = watchSets;
      const newSetQuestions: Record<string, any[]> = {};
      const newTextareas: Record<string, string> = {};
      for (let i = 0; i < sets; i++) {
        const setLetter = String.fromCharCode(65 + i);
        if (setQuestions[setLetter]) {
          newSetQuestions[setLetter] = setQuestions[setLetter];
          newTextareas[setLetter] = textareaValues[setLetter] || "";
        } else {
          newSetQuestions[setLetter] = [];
          newTextareas[setLetter] = "";
        }
      }
      setSetQuestions(newSetQuestions);
      setTextareaValues(newTextareas);
      setCurrentSet("A");
    }
  }, [watchSets, isInitialized]);

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

      setSetQuestions(prev => ({
        ...prev,
        [setLetter]: parsed
      }));
      setTextareaValues(prev => ({
        ...prev,
        [setLetter]: JSON.stringify(parsed, null, 2)
      }));
      setJsonError(null);
      toast.success(`Questions updated for Set ${setLetter}`);
    } catch (error) {
      setJsonError("Invalid JSON format");
    }
  };

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
    const totalQuestions = Object.values(setQuestions).reduce((sum, questions) => sum + questions.length, 0);
    
    if (totalQuestions === 0) {
      toast.error("Please add questions for at least one set");
      return;
    }

    setIsLoading(true);
    const questionsJson = combineAllSets();
    
    const result = await updateQuiz(quiz.id, {
      title: data.title,
      description: data.description,
      sets: data.sets,
      duration: data.duration,
      pointsPerQuestion: data.pointsPerQuestion,
      startDateTime: data.startDateTime,
      endDateTime: data.endDateTime,
      isActive: data.isActive,
      questionsJson,
    });

    if (result.status === "success") {
      toast.success("Quiz updated successfully");
      router.push(`/admin/quizzes/${quiz.quizId}`);
      router.refresh();
    } else {
      toast.error(result.message || "Failed to update quiz");
    }
    setIsLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Quiz ID - Read only */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Quiz ID</label>
          <Input value={quiz.quizId} disabled className="font-mono bg-muted" />
          <p className="text-sm text-muted-foreground">Quiz ID cannot be changed</p>
        </div>

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
                        {num} {num === 1 ? "Set" : "Sets"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Is Active */}
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-end">
                <FormLabel>Quiz Status</FormLabel>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <span className="text-sm text-muted-foreground">
                    {field.value ? "Active" : "Inactive"}
                  </span>
                </div>
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
                Update questions for each set. The current questions are pre-loaded below.
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
                          rows={12}
                          className="font-mono text-sm"
                          key={`questions-textarea-${setLetter}`}
                          value={textareaValues[setLetter] || ""}
                          onChange={(e) => {
                            setTextareaValues(prev => ({
                              ...prev,
                              [setLetter]: e.target.value
                            }));
                          }}
                          id={`questions-${setLetter}`}
                        />

                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={() => {
                              validateAndUpdateSet(textareaValues[setLetter] || "", setLetter);
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
            onClick={() => router.push(`/admin/quizzes/${quiz.quizId}`)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Update Quiz
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
