"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, X, FileText, AlertCircle } from "lucide-react";
import { createSupportTicket, getUserProfileForSupport } from "../actions";

const supportTicketSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters").max(200, "Subject must be less than 200 characters"),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000, "Message must be less than 2000 characters"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  mobileNumber: z.string().optional(),
  whatsappNumber: z.string().optional(),
});

type SupportTicketForm = z.infer<typeof supportTicketSchema>;

interface FileAttachment {
  file: File;
  id: string;
  uploading: boolean;
  uploaded: boolean;
  fileKey?: string;
  error?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain', 'text/csv'
];

export default function ContactSupportForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);

  const form = useForm<SupportTicketForm>({
    resolver: zodResolver(supportTicketSchema),
    defaultValues: {
      subject: "",
      message: "",
      name: "",
      email: "",
      mobileNumber: "",
      whatsappNumber: "",
    },
  });

  // Load user profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const result = await getUserProfileForSupport();
        if (result.status === "success" && result.data) {
          form.reset({
            name: result.data.name || "",
            email: result.data.email || "",
            mobileNumber: result.data.mobileNumber || "",
            whatsappNumber: result.data.whatsappNumber || "",
            subject: "",
            message: "",
          });
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
        toast.error("Failed to load your profile information");
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [form]);

  const handleFileUpload = async (files: FileList) => {
    const newAttachments: FileAttachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File "${file.name}" is too large. Maximum size is 10MB.`);
        continue;
      }

      // Validate file type
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        toast.error(`File type "${file.type}" is not supported for "${file.name}".`);
        continue;
      }

      const attachment: FileAttachment = {
        file,
        id: Math.random().toString(36).substring(7),
        uploading: false,
        uploaded: false,
      };

      newAttachments.push(attachment);
    }

    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const uploadFileToS3 = async (attachment: FileAttachment): Promise<{ fileKey: string; fileName: string; fileSize: number; mimeType: string } | null> => {
    try {
      // Update attachment status
      setAttachments(prev => prev.map(a => 
        a.id === attachment.id ? { ...a, uploading: true, error: undefined } : a
      ));

      // Get signed URL for upload
      const signedUrlResponse = await fetch('/api/s3/support-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: attachment.file.name,
          fileType: attachment.file.type,
          fileSize: attachment.file.size,
          folder: 'support-tickets',
        }),
      });

      if (!signedUrlResponse.ok) {
        throw new Error('Failed to get signed URL');
      }

      const { signedUrl, fileKey } = await signedUrlResponse.json();

      // Upload file to S3
      const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        body: attachment.file,
        headers: {
          'Content-Type': attachment.file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      // Update attachment status
      setAttachments(prev => prev.map(a => 
        a.id === attachment.id 
          ? { ...a, uploading: false, uploaded: true, fileKey, error: undefined }
          : a
      ));

      return {
        fileKey,
        fileName: attachment.file.name,
        fileSize: attachment.file.size,
        mimeType: attachment.file.type,
      };
    } catch (error) {
      console.error('File upload error:', error);
      setAttachments(prev => prev.map(a => 
        a.id === attachment.id 
          ? { ...a, uploading: false, uploaded: false, error: 'Upload failed' }
          : a
      ));
      return null;
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const onSubmit = async (data: SupportTicketForm) => {
    try {
      setIsSubmitting(true);

      // Upload all attachments first
      const uploadedAttachments = [];
      for (const attachment of attachments) {
        if (!attachment.uploaded) {
          const uploadResult = await uploadFileToS3(attachment);
          if (uploadResult) {
            uploadedAttachments.push(uploadResult);
          } else {
            toast.error(`Failed to upload file: ${attachment.file.name}`);
            return;
          }
        } else if (attachment.fileKey) {
          uploadedAttachments.push({
            fileKey: attachment.fileKey,
            fileName: attachment.file.name,
            fileSize: attachment.file.size,
            mimeType: attachment.file.type,
          });
        }
      }

      // Create support ticket
      const result = await createSupportTicket(data, uploadedAttachments);

      if (result.status === "success") {
        toast.success(result.message);
        form.reset({
          subject: "",
          message: "",
          name: data.name,
          email: data.email,
          mobileNumber: data.mobileNumber,
          whatsappNumber: data.whatsappNumber,
        });
        setAttachments([]);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Failed to submit support ticket:", error);
      toast.error("Failed to submit your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (profileLoading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading your profile...</span>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Contact Support
        </CardTitle>
        <CardDescription>
          Submit a support request and we'll get back to you as soon as possible. Your profile information has been pre-filled for your convenience.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="mobileNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your mobile number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="whatsappNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your WhatsApp number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Support Request Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Support Request Details</h3>

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief description of your issue" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Please describe your issue in detail. Include any steps to reproduce the problem, error messages, or additional context that might help us assist you better."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* File Attachments */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Attachments (Optional)</h3>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <div className="text-sm text-muted-foreground mb-2">
                    Drag and drop files here, or click to browse
                  </div>
                  <input
                    type="file"
                    multiple
                    accept={ACCEPTED_FILE_TYPES.join(',')}
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    Choose Files
                  </Button>
                  <div className="text-xs text-muted-foreground mt-2">
                    Supported: Images, PDF, Word, Excel, Text files (Max 10MB each)
                  </div>
                </div>
              </div>

              {/* File List */}
              {attachments.length > 0 && (
                <div className="space-y-2">
                  {attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3 flex-1">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{attachment.file.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatFileSize(attachment.file.size)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {attachment.uploading && (
                          <Badge variant="secondary">
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            Uploading...
                          </Badge>
                        )}
                        {attachment.uploaded && (
                          <Badge variant="outline">Uploaded</Badge>
                        )}
                        {attachment.error && (
                          <Badge variant="destructive">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Error
                          </Badge>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(attachment.id)}
                          disabled={attachment.uploading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full cursor-pointer" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting Your Request...
                </>
              ) : (
                "Submit Support Request"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}