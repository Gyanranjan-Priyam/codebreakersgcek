"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Loader2, Plus, Layers } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createAttendanceSession } from "../actions";
import { getActiveBatchesList } from "@/app/admin/batches/actions";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const formSchema = z.object({
  sessionNumber: z.number().min(1, "Session number must be at least 1"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  date: z.date({
    message: "Please select a date",
  }),
  targetBatchIds: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateSessionDialogProps {
  userId: string;
}

export default function CreateSessionDialog({ userId }: CreateSessionDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [batchesList, setBatchesList] = useState<{ id: string; name: string; code: string }[]>([]);

  useEffect(() => {
    getActiveBatchesList().then((list) => setBatchesList(list));
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sessionNumber: 1,
      title: "",
      targetBatchIds: [],
    },
  });

  const selectedDate = form.watch("date");

  const getDayName = (date: Date) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[date.getDay()];
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const day = getDayName(data.date);
      
      const result = await createAttendanceSession({
        sessionNumber: data.sessionNumber,
        title: data.title,
        date: data.date,
        day,
        targetBatchIds: data.targetBatchIds || [],
        createdBy: userId,
      });

      if (result.status === "success") {
        toast.success(result.message);
        setOpen(false);
        form.reset();
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Session
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Attendance Session</DialogTitle>
          <DialogDescription>
            Create a new attendance session for members to mark their presence
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="sessionNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Number</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter session number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 1)}
                      value={field.value}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter session title"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Session Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isSubmitting}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date("2023-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {selectedDate && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Day: <span className="font-medium">{getDayName(selectedDate)}</span>
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetBatchIds"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-xs">Target Batches (Optional)</FormLabel>
                    <span className="text-[11px] text-muted-foreground">
                      {(field.value?.length || 0) === 0 ? "All Batches" : `${field.value?.length} selected`}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 p-2 rounded-md border bg-muted/20">
                    <Badge
                      variant={(field.value?.length || 0) === 0 ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() => field.onChange([])}
                    >
                      All Batches (Global)
                    </Badge>
                    {batchesList.map((batch) => {
                      const isSelected = field.value?.includes(batch.id);
                      return (
                        <Badge
                          key={batch.id}
                          variant={isSelected ? "default" : "outline"}
                          className="cursor-pointer text-xs font-mono"
                          onClick={() => {
                            const current = field.value || [];
                            if (isSelected) {
                              field.onChange(current.filter((id) => id !== batch.id));
                            } else {
                              field.onChange([...current, batch.id]);
                            }
                          }}
                        >
                          {batch.code}
                        </Badge>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    If selected, only students in the target batch(es) will appear on the attendance roster.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Session
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
