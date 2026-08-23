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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { createQuiz } from "../../actions";
import { generateQuizId } from "../../utils";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Users,
  Globe,
  Key,
  FileText,
  RefreshCw,
  BookOpen,
  Clock,
  Award,
  Calendar,
  AlertTriangle,
  Eye,
} from "lucide-react";

const formSchema = z.object({
  quizId: z.string().min(1, "Quiz ID is required"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  targetAudience: z.enum(["INTERNAL", "EXTERNAL"]),
  accessCode: z.string().optional(),
  formId: z.string().optional(),
  feedbackFormId: z.string().optional(),
  sets: z.number().min(1).max(8),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  pointsPerQuestion: z.number().min(0.01, "Points must be greater than 0"),
  startDateTime: z.date(),
  endDateTime: z.date(),
  questionsJson: z.string().optional(),
}).refine((data) => data.endDateTime > data.startDateTime, {
  message: "End date must be after start date",
  path: ["endDateTime"],
});

type FormData = z.infer<typeof formSchema>;

interface CreateQuizFormProps {
  userId: string;
  forms?: Array<{ id: string; formId: string; title: string }>;
  initialAudience?: "INTERNAL" | "EXTERNAL";
}

export default function CreateQuizForm({ userId, forms = [], initialAudience = "INTERNAL" }: CreateQuizFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [setQuestions, setSetQuestions] = useState<Record<string, any[]>>({});
  const [currentSet, setCurrentSet] = useState("A");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewSet, setPreviewSet] = useState<string>("ALL");

  const generate6DigitCode = () => Math.floor(100000 + Math.random() * 900000).toString();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quizId: "",
      title: "",
      description: "",
      targetAudience: initialAudience,
      accessCode: generate6DigitCode(),
      formId: "",
      feedbackFormId: "",
      sets: 1,
      duration: 30,
      pointsPerQuestion: 1,
      startDateTime: new Date(),
      endDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      questionsJson: "",
    },
  });

  useEffect(() => {
    const id = generateQuizId();
    form.setValue("quizId", id);
  }, []);

  const watchAudience = form.watch("targetAudience");
  const watchSets = form.watch("sets");
  const watchTitle = form.watch("title");
  const watchDescription = form.watch("description");
  const watchDuration = form.watch("duration");
  const watchPoints = form.watch("pointsPerQuestion");
  const watchAccessCode = form.watch("accessCode");

  useEffect(() => {
    const newSetQuestions: Record<string, any[]> = {};
    for (let i = 0; i < watchSets; i++) {
      const setLetter = String.fromCharCode(65 + i);
      newSetQuestions[setLetter] = setQuestions[setLetter] || [];
    }
    setSetQuestions(newSetQuestions);
    setCurrentSet("A");
  }, [watchSets]);

  const validateAndUpdateSet = (jsonString: string, setLetter: string) => {
    if (!jsonString.trim()) { setJsonError(null); return; }
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) { setJsonError("Questions must be an array"); return; }
      const isValid = parsed.every((q: any) => q.id && q.question && Array.isArray(q.options) && q.options.length > 0 && q.answer !== undefined);
      if (!isValid) { setJsonError("Each question must have: id, question, options array, and answer"); return; }
      setSetQuestions(prev => ({ ...prev, [setLetter]: parsed }));
      setJsonError(null);
      toast.success(`Set ${setLetter}: ${parsed.length} questions validated`);
    } catch {
      setJsonError("Invalid JSON format");
    }
  };

  const combineAllSets = () => {
    const all: any = {};
    Object.keys(setQuestions).forEach(k => { if (setQuestions[k].length > 0) all[k] = setQuestions[k]; });
    return JSON.stringify(all);
  };

  const onSubmit = async (data: FormData) => {
    const total = Object.values(setQuestions).reduce((s, q) => s + q.length, 0);
    if (total === 0) { toast.error("Please add questions for at least one set"); return; }
    setIsLoading(true);

    const questionsJson = combineAllSets();

    const result = await createQuiz({
      quizId: data.quizId,
      title: data.title,
      description: data.description,
      targetAudience: data.targetAudience,
      accessCode: data.targetAudience === "EXTERNAL" ? data.accessCode : undefined,
      sets: data.sets,
      duration: data.duration,
      pointsPerQuestion: data.pointsPerQuestion,
      startDateTime: data.startDateTime,
      endDateTime: data.endDateTime,
      questionsJson,
      createdBy: userId,
      formId: data.targetAudience === "EXTERNAL" ? (data.formId === "none" ? null : data.formId) : null,
      feedbackFormId: data.targetAudience === "EXTERNAL" ? (data.feedbackFormId === "none" ? null : data.feedbackFormId) : null,
    });
    if (result.status === "success") {
      toast.success("Quiz created successfully");
      router.push("/admin/quizzes");
    } else {
      toast.error(result.message || "Failed to create quiz");
    }
    setIsLoading(false);
  };

  const totalQuestions = Object.values(setQuestions).reduce((s, q) => s + q.length, 0);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-4xl mx-auto w-full">
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

        {/* External-only config */}
        {watchAudience === "EXTERNAL" && (
          <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Key className="h-4 w-4" />
              External Configuration
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="accessCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>6-Digit Access Code</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input {...field} maxLength={6} className="font-mono text-lg tracking-widest text-center" />
                      </FormControl>
                      <Button type="button" variant="outline" size="icon" onClick={() => form.setValue("accessCode", generate6DigitCode())}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormDescription className="text-xs">Kiosks enter this to register</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="formId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" /> Registration Form (Optional)
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select form..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None (manual entry)</SelectItem>
                        {forms.map((f) => (
                          <SelectItem key={f.id} value={f.formId}>{f.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs">Use response IDs to auto-assign participants</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="feedbackFormId"
                render={({ field }) => (
                  <FormItem className="col-span-1 sm:col-span-2">
                    <FormLabel className="flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-primary" /> Feedback Form (Optional)
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select feedback form..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None (No Feedback Form)</SelectItem>
                        {forms.map((f) => (
                          <SelectItem key={f.id} value={f.formId}>{f.title} ({f.formId})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs">A button will be shown after students complete the quiz to fill this feedback form</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        <Separator />

        {/* Basic details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quizId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>System Quiz ID</FormLabel>
                <FormControl>
                  <Input {...field} disabled className="font-mono text-sm text-muted-foreground" />
                </FormControl>
                <FormDescription className="text-xs">Auto-generated identifier</FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quiz Title *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., Annual Tech Quiz 2026" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description / Rules *</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Enter quiz instructions, proctoring rules, timing constraints..." rows={3} />
              </FormControl>
              <FormDescription className="text-xs">Displayed to candidates before starting</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Config row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 border border-border rounded-lg bg-muted/20">
          <FormField
            control={form.control}
            name="sets"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Question Sets</FormLabel>
                <Select onValueChange={(v) => field.onChange(parseInt(v))} defaultValue={field.value?.toString() || "1"}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8].map(n => (
                      <SelectItem key={n} value={n.toString()}>{n} Set{n > 1 ? "s" : ""} (A{n > 1 ? `-${String.fromCharCode(64+n)}` : ""})</SelectItem>
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
                <FormLabel>Duration (Minutes)</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
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
                <FormLabel>Points / Question</FormLabel>
                <FormControl>
                  <Input type="number" step="any" min={0.01} {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Dates */}
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
                    value={field.value ? new Date(field.value.getTime() - field.value.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
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
                <FormLabel>End Date & Time *</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    value={field.value ? new Date(field.value.getTime() - field.value.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Question Sets */}
        {watchSets > 0 && (
          <div className="space-y-4 pt-2 border-t border-border">
            <div>
              <h3 className="text-base font-semibold">Question Sets</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Paste JSON for each set, then click Validate.</p>
            </div>

            <Tabs value={currentSet} onValueChange={setCurrentSet}>
              <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${watchSets}, 1fr)` }}>
                {Array.from({ length: watchSets }, (_, i) => {
                  const s = String.fromCharCode(65 + i);
                  return (
                    <TabsTrigger key={s} value={s}>
                      Set {s}
                      {setQuestions[s]?.length > 0 && (
                        <Badge variant="secondary" className="ml-1.5 h-5 px-1 text-[10px]">{setQuestions[s].length}</Badge>
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {Array.from({ length: watchSets }, (_, i) => {
                const s = String.fromCharCode(65 + i);
                return (
                  <TabsContent key={s} value={s} className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">JSON for Set {s}</span>
                      {setQuestions[s]?.length > 0 && (
                        <Badge variant="outline" className="text-xs border-green-600 text-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />{setQuestions[s].length} validated
                        </Badge>
                      )}
                    </div>
                    <Textarea
                      id={`questions-${s}`}
                      placeholder={`[\n  {\n    "id": 1,\n    "question": "Sample question?",\n    "options": ["A", "B", "C", "D"],\n    "answer": "A"\n  }\n]`}
                      rows={8}
                      className="font-mono text-sm"
                      defaultValue={setQuestions[s]?.length > 0 ? JSON.stringify(setQuestions[s], null, 2) : ""}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        const el = document.getElementById(`questions-${s}`) as HTMLTextAreaElement;
                        validateAndUpdateSet(el.value, s);
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Validate Set {s}
                    </Button>
                    {jsonError && currentSet === s && (
                      <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>{jsonError}</AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>
        )}

        <FormField control={form.control} name="questionsJson" render={({ field }) => (
          <FormItem className="hidden"><FormControl><Input {...field} type="hidden" /></FormControl></FormItem>
        )} />

        {/* Submit Bar */}
        <div className="flex items-center justify-between gap-3 pt-6 border-t border-border">
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
            <Button type="button" variant="outline" onClick={() => router.push("/admin/quizzes")} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Quiz
            </Button>
          </div>
        </div>

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
      </form>
    </Form>
  );
}
