"use client";

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '../ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { CloudUploadIcon, EyeIcon, FileIcon, ImageIcon, Loader2, TrashIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Progress } from '../ui/progress';
import Image from 'next/image';

interface SimpleUploaderProps {
    value?: string;
    onChange?: (value: string) => void;
    fileTypeAccepted: "image" | "pdf";
    disabled?: boolean;
    maxSize?: number; // in bytes
}

export function Uploader({ value, onChange, fileTypeAccepted, disabled = false, maxSize = 10 * 1024 * 1024 }: SimpleUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [fileName, setFileName] = useState<string>('');

    const uploadFile = useCallback(async (file: File) => {
        setUploading(true);
        setUploadProgress(0);
        setFileName(file.name);
        
        try {
            // Create preview URL
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);

            // Get pre-signed URL from server
            const response = await fetch('/api/s3/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileName: file.name,
                    contentType: file.type,
                    size: file.size,
                    isImage: fileTypeAccepted === 'image',
                    isPdf: fileTypeAccepted === 'pdf',
                })
            });

            if (!response.ok) {
                const error = await response.text();
                console.error('Upload error:', error);
                toast.error('Failed to get upload URL');
                return;
            }

            const { preSignedUrl, key } = await response.json();

            // Upload to S3 with progress tracking
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    const progress = Math.round((event.loaded / event.total) * 100);
                    setUploadProgress(progress);
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status === 200 || xhr.status === 204) {
                    setUploadProgress(100);
                    onChange?.(key);
                    toast.success('File uploaded successfully');
                } else {
                    throw new Error('Upload failed');
                }
            });

            xhr.addEventListener('error', () => {
                throw new Error('Upload failed');
            });

            xhr.open('PUT', preSignedUrl);
            xhr.setRequestHeader('Content-Type', file.type);
            xhr.send(file);

        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Upload failed');
            setPreviewUrl('');
            setUploadProgress(0);
        } finally {
            setUploading(false);
        }
    }, [fileTypeAccepted, onChange]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            uploadFile(acceptedFiles[0]);
        }
    }, [uploadFile]);

    const onDropRejected = useCallback((rejectedFiles: any[]) => {
        if (rejectedFiles.length > 0) {
            const errors = rejectedFiles[0].errors;
            if (errors.some((e: any) => e.code === 'file-invalid-type')) {
                toast.error(`Please upload a valid ${fileTypeAccepted === 'image' ? 'image (JPG/PNG/WebP)' : 'PDF'} file`);
            } else if (errors.some((e: any) => e.code === 'file-too-large')) {
                const maxSizeMB = Math.round(maxSize / 1024 / 1024);
                const maxSizeKB = Math.round(maxSize / 1024);
                const sizeText = maxSizeMB >= 1 ? `${maxSizeMB}MB` : `${maxSizeKB}KB`;
                toast.error(`File is too large. Maximum size is ${sizeText}`);
            }
        }
    }, [fileTypeAccepted, maxSize]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        onDropRejected,
        accept: fileTypeAccepted === 'image' 
            ? { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] }
            : { 'application/pdf': ['.pdf'] },
        maxFiles: 1,
        maxSize: maxSize,
        disabled: disabled || uploading,
    });

    const handleRemove = async () => {
        if (!value) return;
        
        try {
            const response = await fetch('/api/s3/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: value })
            });

            if (response.ok) {
                onChange?.('');
                setPreviewUrl('');
                setFileName('');
                setUploadProgress(0);
                toast.success('File removed');
            } else {
                toast.error('Failed to remove file');
            }
        } catch (error) {
            console.error('Remove error:', error);
            toast.error('Failed to remove file');
        }
    };

    const getFileUrl = (key: string) => {
        return `https://codebreakers.t3.storage.dev/${key}`;
    };

    // Show uploading state with progress
    if (uploading) {
        return (
            <Card className="mt-2">
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                            <div className="flex-1">
                                <p className="text-sm font-medium">Uploading {fileName}...</p>
                                <p className="text-xs text-muted-foreground">{uploadProgress}% complete</p>
                            </div>
                        </div>
                        <Progress value={uploadProgress} className="w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Show uploaded file with preview option
    if (value && !uploading) {
        const fileUrl = getFileUrl(value);
        
        return (
            <Card className="mt-2">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                            {fileTypeAccepted === 'image' ? (
                                <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded overflow-hidden shrink-0">
                                    <Image
                                        src={previewUrl || fileUrl}
                                        alt="Uploaded image"
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                </div>
                            ) : (
                                <FileIcon className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 shrink-0" />
                            )}
                            <div className="min-w-0 flex-1">
                                <p className="font-medium text-sm sm:text-base truncate">File uploaded</p>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                    {fileTypeAccepted === 'image' ? 'Image file' : 'PDF file'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 w-full sm:w-auto">
                            {/* Preview Button */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button type="button" variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                                        <EyeIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" side="top">
                                    {fileTypeAccepted === 'image' ? (
                                        <div className="relative">
                                            <Image
                                                src={previewUrl || fileUrl}
                                                alt="Image preview"
                                                width={300}
                                                height={200}
                                                className="object-contain rounded-md max-w-[90vw] h-auto"
                                                priority
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-[90vw] max-w-[600px] h-[60vh] max-h-[500px]">
                                            <iframe
                                                src={fileUrl}
                                                width="100%"
                                                height="100%"
                                                className="rounded-md"
                                                title="PDF Preview"
                                            />
                                        </div>
                                    )}
                                </PopoverContent>
                            </Popover>
                            
                            {/* Remove Button */}
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={handleRemove}
                                className="h-8 w-8 sm:h-9 sm:w-9"
                            >
                                <TrashIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Show upload area
    return (
        <Card
            {...getRootProps()}
            className={cn(
                "mt-2 border-2 border-dashed cursor-pointer transition-colors",
                isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                disabled && "opacity-50 cursor-not-allowed"
            )}
        >
            <CardContent className="p-4 sm:p-6 md:p-8">
                <input {...getInputProps()} />
                <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
                    {fileTypeAccepted === 'image' ? (
                        <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                    ) : (
                        <FileIcon className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                    )}
                    <div>
                        <p className="text-xs sm:text-sm font-medium">
                            Drop your {fileTypeAccepted === 'image' ? 'image' : 'PDF'} here or click to browse
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                            {fileTypeAccepted === 'image' 
                                ? `Supports JPG, PNG, WebP (max ${maxSize >= 1024 * 1024 ? Math.round(maxSize / 1024 / 1024) + 'MB' : Math.round(maxSize / 1024) + 'KB'})` 
                                : `Supports PDF (max ${maxSize >= 1024 * 1024 ? Math.round(maxSize / 1024 / 1024) + 'MB' : Math.round(maxSize / 1024) + 'KB'})`
                            }
                        </p>
                    </div>
                    <Button type="button" variant="outline" size="sm" className="text-xs sm:text-sm">
                        <CloudUploadIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        Choose File
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
} 