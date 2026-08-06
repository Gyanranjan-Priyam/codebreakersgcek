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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { updateQuiz } from "../../../actions";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Eye,
  Users,
  Globe,
  Key,
  FileText,
  Sparkles,
  RefreshCw,
} from "lucide-react";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  targetAudience: z.enum(["INTERNAL", "EXTERNAL"]),
  accessCode: z.string().optional(),
  formId: z.string().optional(),
  feedbackFormId: z.string().optional(),
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
  targetAudience?: string;
  accessCode?: string | null;
  formId?: string | null;
  feedbackFormId?: string | null;
}

interface EditQuizFormProps {
  quiz: Quiz;
  forms?: Array<{ id: string; formId: string; title: string }>;
}

export default function EditQuizForm({ quiz, forms = [] }: EditQuizFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [setQuestions, setSetQuestions] = useState<Record<string, any[]>>({});
  const [textareaValues, setTextareaValues] = useState<Record<string, string>>({});
  const [currentSet, setCurrentSet] = useState("A");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewSet, setPreviewSet] = useState<string>("ALL");

  const generate6DigitCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: quiz.title,
      description: quiz.description,
      targetAudience: (quiz.targetAudience as "INTERNAL" | "EXTERNAL") || "INTERNAL",
      accessCode: quiz.accessCode || generate6DigitCode(),
      formId: quiz.formId || "",
      feedbackFormId: quiz.feedbackFormId || "",
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

  useEffect(() => {
    if (!isInitialized) {
      try {
        const parsedQuestions = JSON.parse(quiz.questionsJson);
        const initialQuestions: Record<string, any[]> = {};
        const initialTextareas: Record<string, string> = {};
        
        if (typeof parsedQuestions === 'object' && !Array.isArray(parsedQuestions)) {
          for (let i = 0; i < quiz.sets; i++) {
            const setLetter = String.fromCharCode(65 + i);
            initialQuestions[setLetter] = parsedQuestions[setLetter] || [];
            initialTextareas[setLetter] = parsedQuestions[setLetter] 
              ? JSON.stringify(parsedQuestions[setLetter], null, 2)
              : "";
          }
        } else if (Array.isArray(parsedQuestions)) {
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

  const watchAudience = form.watch("targetAudience");
  const watchSets = form.watch("sets");
  const watchTitle = form.watch("title");
  const watchDescription = form.watch("description");
  const watchDuration = form.watch("duration");
  const watchPoints = form.watch("pointsPerQuestion");
  const watchAccessCode = form.watch("accessCode");

  const totalQuestions = Object.values(setQuestions).reduce((sum, qList) => sum + (Array.isArray(qList) ? qList.length : 0), 0);
  
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

    if (data.targetAudience === "EXTERNAL" && (!data.accessCode || data.accessCode.length !== 6)) {
      toast.error("External quizzes require a valid 6-digit access code");
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
      targetAudience: data.targetAudience,
      accessCode: data.targetAudience === "EXTERNAL" ? data.accessCode : null,
      formId: data.targetAudience === "EXTERNAL" ? (data.formId === "none" ? null : data.formId) : null,
      feedbackFormId: data.targetAudience === "EXTERNAL" ? (data.feedbackFormId === "none" ? null : data.feedbackFormId) : null,
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Audience display banner */}
        <div className="flex items-center justify-between gap-4 p-4 border rounded-xl bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              {watchAudience === "EXTERNAL" ? <Globe className="h-5 w-5" /> : <Users className="h-5 w-5" />}
            </div>
            <div>
              <div className="font-semibold text-base flex items-center gap-2">
                <span>{watchAudience === "EXTERNAL" ? "External / Venue Kiosk Quiz" : "Internal Club Members Quiz"}</span>
                <Badge variant="outline" className="text-[10px]">Selected</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {watchAudience === "EXTERNAL" ? "6-digit access code + venue kiosk student assignment" : "Standard quiz for registered CodeBreakers club members"}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewOpen(true)}
            className="cursor-pointer shrink-0"
          >
            <Eye className="h-4 w-4 mr-1.5" />
            Preview Quiz
          </Button>
        </div>

        {/* External Quiz System Details (If Audience is EXTERNAL) */}
        {watchAudience === "EXTERNAL" && (
          <div className="p-5 border border-purple-500/30 bg-purple-950/20 rounded-2xl space-y-5 animate-in fade-in-50">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-purple-400" />
                <h3 className="font-bold text-lg text-purple-200">External Quiz Configuration</h3>
              </div>
              <Badge variant="outline" className="border-purple-500/50 text-purple-300">
                6-Digit Access Code Enabled
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="accessCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-purple-200 font-medium">6-Digit Quiz Access Code</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input 
                          {...field} 
                          maxLength={6} 
                          className="font-mono text-xl tracking-widest text-center font-extrabold bg-background/80 border-purple-500/40 text-purple-300" 
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => form.setValue("accessCode", generate6DigitCode())}
                        title="Generate New Code"
                        className="border-purple-500/40 hover:bg-purple-500/20"
                      >
                        <RefreshCw className="h-4 w-4 text-purple-400" />
                      </Button>
                    </div>
                    <FormDescription className="text-xs text-purple-300/70">
                      External kiosks enter this 6-digit code to register system numbers in real-time.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="formId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-purple-200 font-medium flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-purple-400" />
                      Linked Registration Form (Optional)
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger className="bg-background/80 border-purple-500/40">
                          <SelectValue placeholder="Select registration form..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">-- None (Manual Name/Email Entry) --</SelectItem>
                        {forms.map((f) => (
                          <SelectItem key={f.id} value={f.formId}>
                            {f.title} ({f.formId})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs text-purple-300/70">
                      Use response IDs from this form to assign participants to registered systems in real-time.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="feedbackFormId"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel className="text-purple-200 font-medium flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-purple-400" />
                      Feedback Form (Optional)
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger className="bg-background/80 border-purple-500/40">
                          <SelectValue placeholder="Select feedback form..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">-- None (No Feedback Form) --</SelectItem>
                        {forms.map((f) => (
                          <SelectItem key={f.id} value={f.formId}>
                            {f.title} ({f.formId})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs text-purple-300/70">
                      A button will be displayed at the bottom of the external kiosk completion screen for students to fill out feedback.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* Basic Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <FormLabel className="font-semibold">System Quiz ID</FormLabel>
            <Input value={quiz.quizId} disabled className="font-mono bg-muted/60 text-muted-foreground border-border/60" />
            <FormDescription className="text-xs">Quiz ID cannot be modified</FormDescription>
          </div>

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">Quiz Title *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., Annual Tech Hackathon Quiz 2026" className="bg-background/80" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold">Description / Rules & Regulations *</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Enter detailed quiz instructions, proctoring rules..."
                  rows={4}
                  className="bg-background/80"
                />
              </FormControl>
              <FormDescription className="text-xs">
                Displayed to candidates on the instructions screen before starting the quiz.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Configurations: Sets, Duration, Points */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-5 border border-border/60 rounded-2xl bg-card/30">
          <FormField
            control={form.control}
            name="sets"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">Number of Question Sets</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value?.toString() || "1"}
                >
                  <FormControl>
                    <SelectTrigger className="bg-background/80">
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

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">Duration (Minutes)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                    className="bg-background/80"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pointsPerQuestion"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">Points Per Question</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                    className="bg-background/80"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Start & End Dates and Active Switch */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="startDateTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">Start Date & Time *</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    required
                    value={field.value ? new Date(field.value.getTime() - field.value.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                    className="bg-background/80"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDateTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">End Date & Time *</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    required
                    value={field.value ? new Date(field.value.getTime() - field.value.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                    className="bg-background/80"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-center border border-border/60 rounded-xl p-3 bg-card/40">
                <FormLabel className="font-semibold mb-2">Quiz Status</FormLabel>
                <div className="flex items-center gap-3">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <Badge variant={field.value ? "default" : "secondary"}>
                    {field.value ? "Active & Accepting Attempts" : "Inactive / Draft"}
                  </Badge>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Set Tabs for Questions */}
        {watchSets > 0 && (
          <div className="space-y-4 pt-4 border-t border-border/60">
            <div>
              <h3 className="text-lg font-bold">Question Sets Configuration</h3>
              <p className="text-xs text-muted-foreground">
                Update questions for each set. The current questions are pre-loaded below.
              </p>
            </div>

            <Tabs value={currentSet} onValueChange={setCurrentSet}>
              <TabsList className="grid w-full bg-muted/50 p-1 rounded-xl" style={{ gridTemplateColumns: `repeat(${watchSets}, 1fr)` }}>
                {Array.from({ length: watchSets }, (_, i) => {
                  const setLetter = String.fromCharCode(65 + i);
                  const hasQuestions = setQuestions[setLetter]?.length > 0;
                  return (
                    <TabsTrigger key={setLetter} value={setLetter} className="relative rounded-lg font-bold">
                      Set {setLetter}
                      {hasQuestions && (
                        <Badge variant="default" className="ml-2 h-5 px-1.5 text-xs bg-primary">
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
                  <TabsContent key={setLetter} value={setLetter} className="space-y-4 mt-4">
                    <Card className="p-5 border-border/60 bg-card/60 rounded-2xl">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm">JSON Questions for Set {setLetter}</h4>
                          {setQuestions[setLetter]?.length > 0 && (
                            <Badge variant="outline" className="border-primary/50 text-primary">
                              {setQuestions[setLetter].length} Questions Validated
                            </Badge>
                          )}
                        </div>

                        <Textarea
                          placeholder={`[\n  {\n    "id": 1,\n    "question": "What is 2+2?",\n    "options": ["3", "4", "5", "6"],\n    "answer": "4"\n  }\n]`}
                          rows={12}
                          className="font-mono text-sm bg-background/90"
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

                        <div className="flex flex-wrap gap-3">
                          <Button
                            type="button"
                            onClick={() => {
                              validateAndUpdateSet(textareaValues[setLetter] || "", setLetter);
                            }}
                            variant="secondary"
                            className="flex-1 rounded-xl font-semibold"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2 text-primary" />
                            Update Questions for Set {setLetter}
                          </Button>

                          {setQuestions[setLetter]?.length > 0 && (
                            <Button
                              type="button"
                              onClick={() => {
                                setPreviewSet(setLetter);
                                setIsPreviewOpen(true);
                              }}
                              variant="outline"
                              className="flex-1 rounded-xl font-semibold border-primary/40 text-primary hover:bg-primary/10"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Preview Questions ({setQuestions[setLetter].length})
                            </Button>
                          )}
                        </div>

                        {jsonError && currentSet === setLetter && (
                          <div className="flex items-center gap-2 text-destructive text-sm font-medium bg-destructive/10 p-3 rounded-xl border border-destructive/30">
                            <XCircle className="h-4 w-4 flex-shrink-0" />
                            {jsonError}
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

        <div className="flex items-center justify-between pt-4 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsPreviewOpen(true)}
            className="cursor-pointer"
          >
            <Eye className="h-4 w-4 mr-1.5" />
            Preview Quiz
          </Button>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/admin/quizzes/${quiz.quizId}`)}
              disabled={isLoading}
              className="rounded-xl px-6"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="rounded-xl px-8 font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20"
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </div>
      </form>

      {/* ── RIGHT SIDEBAR LIVE PREVIEW SHEET WITH LENIS SCROLL FIX ── */}
      <Sheet open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <SheetContent side="right" className="sm:max-w-xl w-full p-0 flex h-dvh max-h-screen flex-col overflow-hidden bg-background border-l shadow-2xl">
          <div className="shrink-0 border-b bg-card">
            <SheetHeader className="px-6 pt-6 pb-4">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                <SheetTitle className="text-lg">Quiz Live Preview</SheetTitle>
              </div>
              <SheetDescription className="text-xs">
                Real-time preview of quiz details, settings, and parsed question sets.
              </SheetDescription>
            </SheetHeader>
          </div>

          {/* Scrollable Body Container with Lenis Prevent */}
          <div 
            data-lenis-prevent 
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-6 space-y-6"
            onWheel={(e) => e.stopPropagation()}
            onTouchMoveCapture={(e) => e.stopPropagation()}
          >
            {/* Header Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={watchAudience === "EXTERNAL" ? "secondary" : "outline"}>
                  {watchAudience === "EXTERNAL" ? <><Globe className="h-3 w-3 mr-1" />External Kiosk</> : <><Users className="h-3 w-3 mr-1" />Internal Members</>}
                </Badge>
                {watchAudience === "EXTERNAL" && watchAccessCode && (
                  <Badge variant="outline" className="font-mono text-xs">
                    Access Code: {watchAccessCode}
                  </Badge>
                )}
              </div>
              <h3 className="text-xl font-bold">{watchTitle || "Untitled Quiz"}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {watchDescription || "No description provided yet."}
              </p>
            </div>

            <Separator />

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Duration</p>
                <p className="text-base font-bold">{watchDuration || 0} mins</p>
              </div>
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Sets</p>
                <p className="text-base font-bold">{watchSets}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Points/Q</p>
                <p className="text-base font-bold">{watchPoints || 1}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Questions</p>
                <p className="text-base font-bold">{totalQuestions}</p>
              </div>
            </div>

            <Separator />

            {/* Detailed Question Sets Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <span>Question Sets Breakdown</span>
                  <span className="text-xs text-muted-foreground font-normal">{totalQuestions} total questions</span>
                </h4>
                {watchSets > 1 && (
                  <Select value={previewSet} onValueChange={setPreviewSet}>
                    <SelectTrigger className="w-[110px] h-8 text-xs font-medium bg-muted/30">
                      <SelectValue placeholder="All Sets" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Sets</SelectItem>
                      {Array.from({ length: watchSets }).map((_, i) => {
                        const sLetter = String.fromCharCode(65 + i);
                        return <SelectItem key={sLetter} value={sLetter}>Set {sLetter}</SelectItem>;
                      })}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {Object.keys(setQuestions).length === 0 || totalQuestions === 0 ? (
                <div className="p-8 text-center border-2 border-dashed rounded-xl bg-muted/30">
                  <p className="text-sm text-muted-foreground">No questions added yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">Add and validate question JSON in the form to see preview.</p>
                </div>
              ) : (
                Object.keys(setQuestions)
                  .filter((sLetter) => previewSet === "ALL" || previewSet === sLetter)
                  .map((sLetter) => {
                  const setList = setQuestions[sLetter] || [];
                  return (
                    <Card key={sLetter} className="overflow-hidden border">
                      <CardHeader className="p-4 bg-muted/50 border-b">
                        <CardTitle className="text-sm flex items-center justify-between">
                          <span>Set {sLetter}</span>
                          <Badge variant="outline" className="text-xs">
                            {setList.length} Question{setList.length !== 1 ? 's' : ''}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4">
                        {setList.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic">No questions in this set.</p>
                        ) : (
                          setList.map((qItem: any, qIdx: number) => (
                            <div key={qIdx} className="p-3 border rounded-lg bg-card space-y-2 text-xs">
                              <p className="font-semibold text-sm">
                                Q{qIdx + 1}. {qItem.question}
                              </p>
                              {Array.isArray(qItem.options) && (
                                <div className="space-y-1 pl-2">
                                  {qItem.options.map((opt: string, optIdx: number) => (
                                    <div
                                      key={optIdx}
                                      className={`p-2 rounded border flex items-center justify-between ${
                                        qItem.answer === optIdx
                                          ? "border-green-600/40 bg-green-500/10 text-green-700 dark:text-green-400 font-medium"
                                          : "border-border bg-background text-muted-foreground"
                                      }`}
                                    >
                                      <span>
                                        {String.fromCharCode(65 + optIdx)}. {opt}
                                      </span>
                                      {qItem.answer === optIdx && (
                                        <Badge variant="outline" className="text-[10px] border-green-600 text-green-600">
                                          Answer
                                        </Badge>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </Form>
  );
}
