"use client";

import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Download, FileText, Image, Video, File } from "lucide-react";
import { ResourcePreview } from "./resource-preview";

function getResourceIcon(type: string, size: string = "h-8 w-8") {
  const className = `${size}`;
  switch (type) {
    case "PDF":
      return <FileText className={className} />;
    case "IMAGE":
      return <Image className={className} />;
    case "VIDEO":
      return <Video className={className} />;
    default:
      return <File className={className} />;
  }
}

function getResourceTypeColor(type: string) {
  switch (type) {
    case "PDF":
      return "bg-red-500/10 text-red-500";
    case "IMAGE":
      return "bg-blue-500/10 text-blue-500";
    case "VIDEO":
      return "bg-purple-500/10 text-purple-500";
    case "DOCUMENT":
      return "bg-green-500/10 text-green-500";
    default:
      return "bg-gray-500/10 text-gray-500";
  }
}

function extractGoogleDriveId(url: string): string | null {
  const patterns = [
    /\/file\/d\/([^\/]+)/,
    /id=([^&]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function ResourceCard({ resource }: { resource: any }) {
  const driveId = extractGoogleDriveId(resource.url);
  const downloadUrl = driveId 
    ? `https://drive.google.com/uc?export=download&id=${driveId}`
    : resource.url;

  // For videos, show card with preview
  if (resource.type === "VIDEO") {
    return (
      <Card>
        <CardContent className="p-3">
          <ResourcePreview resource={resource} />
          <div className="p-6 space-y-4">
            <div>
              <CardTitle className="text-xl mb-2">{resource.title}</CardTitle>
              {resource.description && (
                <CardDescription>{resource.description}</CardDescription>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={getResourceTypeColor(resource.type)}>
                {resource.type}
              </Badge>
              {resource.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // For documents (PDF, Image, etc), show compact list item
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
            {getResourceIcon(resource.type)}
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <h3 className="font-semibold text-base line-clamp-1">{resource.title}</h3>
              {resource.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {resource.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={getResourceTypeColor(resource.type)} variant="secondary">
                {resource.type}
              </Badge>
              {resource.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <Button asChild size="sm">
              <a href={resource.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3 sm:mr-2" />
                <span className="hidden sm:inline">Open</span>
              </a>
            </Button>
            {resource.downloadable && (
              <Button asChild variant="outline" size="sm">
                <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="h-3 w-3 sm:mr-2" />
                  <span className="hidden sm:inline">Download</span>
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
