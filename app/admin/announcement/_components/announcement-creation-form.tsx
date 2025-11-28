"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Clock, FileText, Image, Loader2, Plus, Save, Send } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultipleUploader } from "@/components/file-uploader/MultipleUploader";
import { cn } from "@/lib/utils";
import {
  announcementSchema,
  AnnouncementSchemaType,
  announcementCategories,
  announcementPriorities,
  announcementAudiences,
  recurrenceTypes,
} from "@/lib/zodSchema";
import { RichTextEditor } from "@/components/admin_components/rich-text-editor/Editor";
import { createAnnouncement } from "../action";

interface AnnouncementFormProps {
  events?: Array<{ id: string; title: string; date: Date }>;
  onSuccess?: () => void;
  editingAnnouncement?: {
    id: string;
    title: string;
    description: string;
    category: string;
    priority: string;
    audience: string;
    publishDate: Date;
    expiryDate?: Date | null;
    isPinned: boolean;
    showInHomeBanner: boolean;
    isRecurring: boolean;
    relatedEvent?: { id: string; title: string; slugId: string } | null;
  } | null;
  onCancelEdit?: () => void;
}

export function AnnouncementCreationForm({ 
  events = [], 
  onSuccess, 
  editingAnnouncement, 
  onCancelEdit 
}: AnnouncementFormProps) {
  const [pending, startTransition] = useTransition();
  
  const form = useForm<AnnouncementSchemaType>({
    resolver: zodResolver(announcementSchema) as any,
    mode: "onSubmit", // Only validate on submit to prevent auto-submission
    defaultValues: editingAnnouncement ? {
      title: editingAnnouncement.title,
      description: editingAnnouncement.description,
      category: editingAnnouncement.category as any,
      priority: editingAnnouncement.priority as any,
      attachmentKeys: [],
      imageKeys: [],
      audience: editingAnnouncement.audience as any,
      sendNotifications: false,
      isPinned: editingAnnouncement.isPinned,
      showInHomeBanner: editingAnnouncement.showInHomeBanner,
      publishDate: new Date(editingAnnouncement.publishDate),
      expiryDate: editingAnnouncement.expiryDate ? new Date(editingAnnouncement.expiryDate) : null,
      isRecurring: editingAnnouncement.isRecurring,
      recurrenceType: "NONE",
      recurrenceInterval: null,
    } : {
      title: "",
      description: "",
      category: "GENERAL",
      priority: "NORMAL",
      attachmentKeys: [],
      imageKeys: [],
      audience: "PUBLIC",
      sendNotifications: false,
      isPinned: false,
      showInHomeBanner: false,
      publishDate: new Date(),
      expiryDate: null,
      isRecurring: false,
      recurrenceType: "NONE",
      recurrenceInterval: null,
    },
  });

  const isRecurring = form.watch("isRecurring");
  const recurrenceType = form.watch("recurrenceType");
  const publishDate = form.watch("publishDate");

  const onSubmit = async (data: AnnouncementSchemaType) => {
    startTransition(async () => {
      try {
        const result = await createAnnouncement(data);
        
        if (result.success) {
          toast.success(result.message);
          form.reset();
          onSuccess?.();
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        console.error("Error creating announcement:", error);
        toast.error("Failed to create announcement. Please try again.");
      }
    });
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
          {editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {editingAnnouncement 
            ? 'Update your announcement details below.' 
            : 'Create a new announcement to communicate with your audience effectively.'
          }
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Provide the essential details for your announcement.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control as any}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter announcement title"
                        {...field}
                        className="text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <RichTextEditor field={field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <FormField
                  control={form.control as any}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {announcementCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category.replace("_", " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority Level *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {announcementPriorities.map((priority) => (
                            <SelectItem key={priority} value={priority}>
                              {priority.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="relatedEventId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Related Event (Optional)</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                        value={field.value || "none"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select event" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No related event</SelectItem>
                          {events.map((event) => (
                            <SelectItem key={event.id} value={event.id}>
                              {event.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Media & Attachments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Media & Attachments
              </CardTitle>
              <CardDescription>
                Add supporting files and images to your announcement.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control as any}
                name="attachmentKeys"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Attachments (Optional)</FormLabel>
                    <FormDescription>
                      Upload PDFs, documents, rules, or schedules (Max 10 files, 10MB each)
                    </FormDescription>
                    <FormControl>
                      <MultipleUploader
                        onChange={field.onChange}
                        value={field.value}
                        maxFiles={10}
                        minFiles={0}
                        accept="documents"
                        maxFileSize={10}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="imageKeys"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Images (Optional)</FormLabel>
                    <FormDescription>
                      Upload images, posters, or visual elements (Max 5 images, 5MB each)
                    </FormDescription>
                    <FormControl>
                      <MultipleUploader
                        onChange={field.onChange}
                        value={field.value}
                        maxFiles={5}
                        minFiles={0}
                        accept="images"
                        maxFileSize={5}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Visibility & Control */}
          <Card>
            <CardHeader>
              <CardTitle>Visibility & Control</CardTitle>
              <CardDescription>
                Configure who can see this announcement and special display options.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control as any}
                name="audience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Audience *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select audience" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {announcementAudiences.map((audience) => (
                          <SelectItem key={audience} value={audience}>
                            {audience.replace("_", " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                <FormField
                  control={form.control as any}
                  name="sendNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 md:p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm md:text-base">Send Notifications</FormLabel>
                        <FormDescription className="text-xs md:text-sm">
                          Send push/email notifications to the audience
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="isPinned"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 md:p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm md:text-base">Pin Announcement</FormLabel>
                        <FormDescription className="text-xs md:text-sm">
                          Highlight at the top of announcements list
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="showInHomeBanner"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 md:p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm md:text-base">Show in Homepage Banner</FormLabel>
                        <FormDescription className="text-xs md:text-sm">
                          Display prominently on the homepage
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Scheduling */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Scheduling
              </CardTitle>
              <CardDescription>
                Set when this announcement should be published and when it expires.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <FormField
                  control={form.control as any}
                  name="publishDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Publish Date & Time *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP 'at' p")
                              ) : (
                                <span>Pick publish date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              if (date) {
                                // Preserve time if already set
                                const existingDate = field.value || new Date();
                                date.setHours(existingDate.getHours());
                                date.setMinutes(existingDate.getMinutes());
                                field.onChange(date);
                              }
                            }}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                          <div className="p-3 border-t">
                            <Label htmlFor="publish-time">Time:</Label>
                            <Input
                              id="publish-time"
                              type="time"
                              value={field.value ? format(field.value, "HH:mm") : ""}
                              onChange={(e) => {
                                if (field.value && e.target.value) {
                                  const [hours, minutes] = e.target.value.split(":").map(Number);
                                  const newDate = new Date(field.value);
                                  newDate.setHours(hours, minutes);
                                  field.onChange(newDate);
                                }
                              }}
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Immediate publishing or schedule for later
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Expiry Date & Time (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP 'at' p")
                              ) : (
                                <span>Pick expiry date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={(date) => {
                              if (date) {
                                // Set to end of day by default
                                date.setHours(23, 59, 59, 999);
                                field.onChange(date);
                              } else {
                                field.onChange(null);
                              }
                            }}
                            disabled={(date) =>
                              date < (publishDate || new Date())
                            }
                            initialFocus
                          />
                          <div className="p-3 border-t">
                            <Label htmlFor="expiry-time">Time:</Label>
                            <Input
                              id="expiry-time"
                              type="time"
                              value={field.value ? format(field.value, "HH:mm") : ""}
                              onChange={(e) => {
                                if (field.value && e.target.value) {
                                  const [hours, minutes] = e.target.value.split(":").map(Number);
                                  const newDate = new Date(field.value);
                                  newDate.setHours(hours, minutes);
                                  field.onChange(newDate);
                                }
                              }}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => field.onChange(null)}
                              className="w-full mt-2"
                            >
                              Clear
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Auto-remove announcement after this date
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Recurring Options */}
              <div className="space-y-4">
                <FormField
                  control={form.control as any}
                  name="isRecurring"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 md:p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm md:text-base">Recurring Announcement</FormLabel>
                        <FormDescription className="text-xs md:text-sm">
                          Send this announcement repeatedly at specified intervals
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {isRecurring && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-2 md:ml-4">
                    <FormField
                      control={form.control as any}
                      name="recurrenceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recurrence Type *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select recurrence" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {recurrenceTypes.filter(type => type !== "NONE").map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {recurrenceType === "HOURLY" && (
                      <FormField
                        control={form.control as any}
                        name="recurrenceInterval"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Interval (Hours) *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                max="168"
                                placeholder="Enter hours"
                                {...field}
                                value={field.value || ""}
                                onChange={(e) => field.onChange(Number(e.target.value) || null)}
                              />
                            </FormControl>
                            <FormDescription>
                              How many hours between each announcement
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 pt-4 md:pt-6">
            <Button type="submit" className="flex-1 w-full sm:w-auto" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span className="hidden sm:inline">{editingAnnouncement ? 'Updating...' : 'Creating...'}</span>
                  <span className="sm:hidden">{editingAnnouncement ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">{editingAnnouncement ? 'Update Announcement' : 'Create Announcement'}</span>
                  <span className="sm:hidden">{editingAnnouncement ? 'Update' : 'Create'}</span>
                </>
              )}
            </Button>
            
            {editingAnnouncement && (
              <Button type="button" variant="outline" onClick={onCancelEdit} className="w-full sm:w-auto">
                Cancel
              </Button>
            )}
            
            <Button type="button" variant="outline" onClick={() => form.reset()} className="w-full sm:w-auto">
              <span className="hidden sm:inline">Reset Form</span>
              <span className="sm:hidden">Reset</span>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}