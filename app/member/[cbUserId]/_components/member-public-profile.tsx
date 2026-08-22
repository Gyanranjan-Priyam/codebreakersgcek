"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Phone,
  MapPin,
  School,
  Hash,
  User,
  BookOpen,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface MemberPublicProfileProps {
  member: {
    id: string;
    cbUserId: string | null;
    name: string;
    email: string;
    username: string | null;
    firstName: string | null;
    middleName: string | null;
    lastName: string | null;
    profileImageKey: string | null;
    registration: string | null;
    rollNumber: string | null;
    branch: string | null;
    admissionYear: string | null;
    mobileNumber: string | null;
    whatsappNumber: string | null;
    collegeName: string | null;
    collegeAddress: string | null;
    state: string | null;
    district: string | null;
    githubUsername: string | null;
    createdAt: Date;
    role: string | null;
    banned: boolean | null;
  };
}

export default function MemberPublicProfile({ member }: MemberPublicProfileProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getImageUrl = (imageKey: string) => {
    return `https://codebreakers.t3.storage.dev/${imageKey}`;
  };

  const profileImageUrl = member.profileImageKey
    ? getImageUrl(member.profileImageKey)
    : null;

  const InfoItem = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: any;
    label: string;
    value: string | null | undefined;
  }) => {
    if (!value) return null;
    return (
      <div className="flex items-start gap-3">
        <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <div className="space-y-0.5 min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-sm font-medium break-words">{value}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 max-w-2xl">
          <Link href="/" className="flex items-center gap-2">
            <img src="/assets/logo.png" alt="CodeBreakers" className="h-8 w-8" />
            <span className="font-semibold text-sm">CodeBreakers GCEK</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Profile Header Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-28 w-28 border-4 border-background shadow-md">
                {profileImageUrl ? (
                  <AvatarImage src={profileImageUrl} alt={member.name} />
                ) : null}
                <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                  {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>

              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold">{member.name}</h1>
                {member.username && (
                  <p className="text-sm text-muted-foreground">@{member.username}</p>
                )}
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {member.cbUserId && (
                    <Badge variant="secondary" className="font-mono text-xs">
                      {member.cbUserId}
                    </Badge>
                  )}
                  {member.role === "admin" && (
                    <Badge className="bg-purple-600 text-white border-none text-xs">
                      Admin
                    </Badge>
                  )}
                  {member.branch && (
                    <Badge variant="outline" className="text-xs">
                      {member.branch}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoItem icon={Mail} label="Email" value={member.email} />
              <InfoItem icon={Phone} label="Mobile" value={member.mobileNumber} />
              <InfoItem icon={Phone} label="WhatsApp" value={member.whatsappNumber} />
            </div>
            {member.githubUsername && (
              <>
                <Separator />
                <div className="flex items-start gap-3">
                  <svg className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground">GitHub</p>
                    <a
                      href={`https://github.com/${member.githubUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      @{member.githubUsername}
                    </a>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Academic Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4" />
              Academic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoItem icon={Hash} label="Registration No." value={member.registration} />
              <InfoItem icon={Hash} label="Roll Number" value={member.rollNumber} />
              <InfoItem icon={School} label="Branch" value={member.branch} />
              <InfoItem icon={Calendar} label="Admission Year" value={member.admissionYear} />
            </div>
            {(member.collegeName || member.collegeAddress) && (
              <>
                <Separator />
                <div className="space-y-4">
                  <InfoItem icon={School} label="College" value={member.collegeName} />
                  <InfoItem icon={MapPin} label="College Address" value={member.collegeAddress} />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Location */}
        {(member.state || member.district) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoItem icon={MapPin} label="State" value={member.state} />
                <InfoItem icon={MapPin} label="District" value={member.district} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">
            Member since {format(new Date(member.createdAt), "MMMM yyyy")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            CodeBreakers — Government College of Engineering Kalahandi
          </p>
        </div>
      </div>
    </div>
  );
}
