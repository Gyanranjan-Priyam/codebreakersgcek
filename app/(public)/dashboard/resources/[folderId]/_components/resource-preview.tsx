"use client";

import { useState } from "react";
import { FileText, Image, Video, File } from "lucide-react";

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

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
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

export function ResourcePreview({ resource }: { resource: any }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const youtubeId = extractYouTubeId(resource.url);
  const driveId = extractGoogleDriveId(resource.url);

  // For YouTube videos, show thumbnail with play overlay, play inline when clicked
  if (youtubeId) {
    if (isPlaying) {
      return (
        <div className="aspect-video w-full rounded-lg overflow-hidden">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
            title={resource.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      );
    }

    return (
      <div 
        className="aspect-video w-full rounded-lg overflow-hidden relative group cursor-pointer"
        onClick={() => setIsPlaying(true)}
      >
        <img
          src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
          alt={resource.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to hqdefault if maxresdefault is not available
            e.currentTarget.src = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
          }}
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
            <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1"></div>
          </div>
        </div>
      </div>
    );
  }

  // For Google Drive videos, show thumbnail with play overlay, play inline when clicked
  if (driveId && resource.type === "VIDEO") {
    if (isPlaying) {
      return (
        <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
          <iframe
            src={`https://drive.google.com/file/d/${driveId}/preview`}
            width="100%"
            height="100%"
            allow="autoplay"
            className="w-full h-full"
          />
        </div>
      );
    }

    return (
      <div 
        className="aspect-video w-full rounded-lg overflow-hidden relative group cursor-pointer bg-black"
        onClick={() => setIsPlaying(true)}
      >
        <img
          src={`/api/drive-thumbnail?fileId=${driveId}`}
          alt={resource.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to icon if thumbnail fails to load
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        <div className="absolute inset-0 hidden items-center justify-center bg-linear-to-br from-purple-500/20 to-blue-500/20">
          <div className="text-center">
            {getResourceIcon(resource.type, "h-16 w-16")}
            <p className="mt-2 text-sm font-medium">Google Drive Video</p>
          </div>
        </div>
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/30 transition-colors">
          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
            <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-gray-700 border-b-8 border-b-transparent ml-1"></div>
          </div>
        </div>
      </div>
    );
  }

  // For non-videos (PDF, Image, Document), show icon only
  return (
    <div className="aspect-video w-full rounded-lg bg-muted flex items-center justify-center">
      {getResourceIcon(resource.type, "h-16 w-16")}
    </div>
  );
}
